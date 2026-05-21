import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainEventService } from './blockchain-event.service';
import { BlockchainService } from './blockchain.service';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { CachedProvenanceLog } from '../database/entities/cached-provenance-log.entity';

describe('BlockchainEventService', () => {
  let service: BlockchainEventService;
  let landNftRepo: jest.Mocked<Repository<LandNFT>>;
  let blockchainLogRepo: jest.Mocked<Repository<BlockchainLog>>;
  let provenanceLogRepo: jest.Mocked<Repository<CachedProvenanceLog>>;

  const registeredHooks = new Map<string, (data: any) => void>();

  const mockBlockchainService = {
    registerEventSyncHook: jest.fn((event, cb) => {
      registeredHooks.set(`registry:${event}`, cb);
    }),
    registerMultiSigSyncHook: jest.fn((event, cb) => {
      registeredHooks.set(`multisig:${event}`, cb);
    }),
    registerWalletOverrideSyncHook: jest.fn((event, cb) => {
      registeredHooks.set(`wallet:${event}`, cb);
    }),
    registerEContractSyncHook: jest.fn((event, cb) => {
      registeredHooks.set(`econtract:${event}`, cb);
    }),
    registerReceiptSyncHook: jest.fn((event, cb) => {
      registeredHooks.set(`receipt:${event}`, cb);
    }),
    provider: {
      getTransactionReceipt: jest.fn(),
      getBlock: jest.fn(),
    },
    eContractContract: {
      getContract: jest.fn(),
    },
  };

  // Inject a mock provider in blockchainService for logs
  (mockBlockchainService as any).provider = mockBlockchainService.provider;

  const mockLandRecordRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockLandNftRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWalletRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockBlockchainLogRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((x) => x),
  };

  const mockProvenanceLogRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((x) => x),
  };

  beforeEach(async () => {
    registeredHooks.clear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainEventService,
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: getRepositoryToken(LandRecord),
          useValue: mockLandRecordRepo,
        },
        {
          provide: getRepositoryToken(LandNFT),
          useValue: mockLandNftRepo,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepo,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        {
          provide: getRepositoryToken(BlockchainLog),
          useValue: mockBlockchainLogRepo,
        },
        {
          provide: getRepositoryToken(CachedProvenanceLog),
          useValue: mockProvenanceLogRepo,
        },
      ],
    }).compile();

    service = module.get<BlockchainEventService>(BlockchainEventService);
    landNftRepo = module.get(getRepositoryToken(LandNFT));
    blockchainLogRepo = module.get(getRepositoryToken(BlockchainLog));
    provenanceLogRepo = module.get(getRepositoryToken(CachedProvenanceLog));

    // Manually run init to register hooks
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register all expected blockchain event hooks', () => {
    expect(mockBlockchainService.registerEventSyncHook).toHaveBeenCalledWith('LandCreated', expect.any(Function));
    expect(mockBlockchainService.registerEventSyncHook).toHaveBeenCalledWith('LandStatusChanged', expect.any(Function));
    expect(mockBlockchainService.registerMultiSigSyncHook).toHaveBeenCalledWith('TransactionSigned', expect.any(Function));
    expect(mockBlockchainService.registerWalletOverrideSyncHook).toHaveBeenCalledWith('RecoveryApproved', expect.any(Function));
    expect(mockBlockchainService.registerEContractSyncHook).toHaveBeenCalledWith('TaxPaid', expect.any(Function));
    expect(mockBlockchainService.registerReceiptSyncHook).toHaveBeenCalledWith('ReceiptRecorded', expect.any(Function));
  });

  describe('LandCreated Event Handling', () => {
    it('should update database and create provenance log when LandCreated event fires', async () => {
      const hook = registeredHooks.get('registry:LandCreated');
      expect(hook).toBeDefined();

      const mockNft = {
        tokenId: '100',
        status: 'Draft',
        ownerWallet: '0xOldOwner',
      };
      landNftRepo.findOne.mockResolvedValue(mockNft as any);
      blockchainLogRepo.findOne.mockResolvedValue(null);

      mockBlockchainService.provider.getTransactionReceipt.mockResolvedValue({
        blockNumber: 10,
        status: 1,
        gasUsed: BigInt(21000),
        gasPrice: BigInt(1000000000), // 1 Gwei
      } as any);

      mockBlockchainService.provider.getBlock.mockResolvedValue({
        timestamp: 1716280000,
      } as any);

      // Fire the hook
      await hook!({
        args: [BigInt(100), '0xNewOwner', 'ipfs://QmTest'],
        eventLog: {
          transactionHash: '0xTxHash',
          blockNumber: 10,
        },
      });

      // NFT status should be updated to Normal and ownerWallet to new wallet
      expect(landNftRepo.findOne).toHaveBeenCalledWith({ where: { tokenId: '100' } });
      expect(landNftRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenId: '100',
          status: 'Normal',
          ownerWallet: '0xNewOwner',
        }),
      );

      // Blockchain log should be recorded
      expect(blockchainLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          txHash: '0xTxHash',
          actionType: 'LandCreated',
          status: 'Success',
          gasFee: 0.000021, // 21000 * 1e9 / 1e18
        }),
      );
      expect(blockchainLogRepo.save).toHaveBeenCalled();

      // Provenance log should be cached
      expect(provenanceLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenId: '100',
          eventType: 'LandCreated',
          txHash: '0xTxHash',
          blockNumber: 10,
        }),
      );
      expect(provenanceLogRepo.save).toHaveBeenCalled();
    });
  });

  describe('LandStatusChanged Event Handling', () => {
    it('should map states correctly to DB status when LandStatusChanged event fires', async () => {
      const hook = registeredHooks.get('registry:LandStatusChanged');
      expect(hook).toBeDefined();

      const mockNft = {
        tokenId: '200',
        status: 'Normal',
      };
      landNftRepo.findOne.mockResolvedValue(mockNft as any);
      blockchainLogRepo.findOne.mockResolvedValue({} as any); // Already exists to bypass fetch

      // Test transitioning to status 3 (Trading)
      await hook!({
        args: [BigInt(200), 2, 3], // old status 2 (DA_CAP_SO), new status 3 (DANG_GIAO_DICH/Trading)
        eventLog: {
          transactionHash: '0xTxHash2',
          blockNumber: 11,
        },
      });

      expect(landNftRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenId: '200',
          status: 'Trading',
        }),
      );
    });
  });

  describe('TransactionSigned Event Handling', () => {
    it('should log transaction signed event', async () => {
      const hook = registeredHooks.get('multisig:TransactionSigned');
      expect(hook).toBeDefined();

      blockchainLogRepo.findOne.mockResolvedValue(null);
      mockBlockchainService.provider.getTransactionReceipt.mockResolvedValue({
        blockNumber: 12,
        status: 1,
        gasUsed: BigInt(30000),
        gasPrice: BigInt(1000000000),
      } as any);
      mockBlockchainService.provider.getBlock.mockResolvedValue({
        timestamp: 1716281000,
      } as any);

      await hook!({
        args: [BigInt(1), '0xSigner', 1, true],
        eventLog: {
          transactionHash: '0xTxHash3',
          blockNumber: 12,
        },
      });

      expect(blockchainLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          txHash: '0xTxHash3',
          actionType: 'TransactionSigned',
          status: 'Success',
        }),
      );
    });
  });

  describe('RecoveryApproved Event Handling', () => {
    it('should log recovery approved event', async () => {
      const hook = registeredHooks.get('wallet:RecoveryApproved');
      expect(hook).toBeDefined();

      blockchainLogRepo.findOne.mockResolvedValue(null);
      mockBlockchainService.provider.getTransactionReceipt.mockResolvedValue({
        blockNumber: 13,
        status: 1,
        gasUsed: BigInt(40000),
        gasPrice: BigInt(1000000000),
      } as any);
      mockBlockchainService.provider.getBlock.mockResolvedValue({
        timestamp: 1716282000,
      } as any);

      await hook!({
        args: [BigInt(5), '0xcitizenHash', '0xNewWallet'],
        eventLog: {
          transactionHash: '0xTxHash4',
          blockNumber: 13,
        },
      });

      expect(blockchainLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          txHash: '0xTxHash4',
          actionType: 'RecoveryApproved',
        }),
      );
    });
  });

  describe('TaxPaid Event Handling', () => {
    it('should query contract and create provenance log for TaxPaid', async () => {
      const hook = registeredHooks.get('econtract:TaxPaid');
      expect(hook).toBeDefined();

      blockchainLogRepo.findOne.mockResolvedValue({} as any); // Bypass fetch receipt

      mockBlockchainService.eContractContract.getContract.mockResolvedValue({
        tokenId: BigInt(300),
      } as any);

      await hook!({
        args: [BigInt(15), BigInt(200), BigInt(50)], // contractId, taxTNCN, feePreBa
        eventLog: {
          transactionHash: '0xTxHash5',
          blockNumber: 14,
        },
      });

      expect(mockBlockchainService.eContractContract.getContract).toHaveBeenCalledWith(BigInt(15));
      expect(provenanceLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenId: '300',
          eventType: 'TaxPaid',
          txHash: '0xTxHash5',
        }),
      );
    });
  });

  describe('ReceiptRecorded Event Handling', () => {
    it('should log receipt recorded event', async () => {
      const hook = registeredHooks.get('receipt:ReceiptRecorded');
      expect(hook).toBeDefined();

      blockchainLogRepo.findOne.mockResolvedValue(null);
      mockBlockchainService.provider.getTransactionReceipt.mockResolvedValue({
        blockNumber: 15,
        status: 1,
        gasUsed: BigInt(50000),
        gasPrice: BigInt(2000000000),
      } as any);
      mockBlockchainService.provider.getBlock.mockResolvedValue({
        timestamp: 1716283000,
      } as any);

      await hook!({
        args: ['0xReceiptTxHash', '0xPayer', BigInt(5000), 'ipfs://QmReceipt', BigInt(1716283000)],
        eventLog: {
          transactionHash: '0xTxHash6',
          blockNumber: 15,
        },
      });

      expect(blockchainLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          txHash: '0xTxHash6',
          actionType: 'ReceiptRecorded',
          gasFee: 0.0001, // 50000 * 2e9 / 1e18
        }),
      );
    });
  });
});
