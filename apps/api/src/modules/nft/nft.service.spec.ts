import { Test, TestingModule } from '@nestjs/testing';
import { NftService } from './nft.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandNFT } from '../database/entities/land-nft.entity';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConfigService } from '@nestjs/config';
import { IPFS_CLIENT } from '../ipfs/ipfs.constants';
import { NotFoundException } from '@nestjs/common';

describe('NftService', () => {
  let service: NftService;
  let landNftRepository: jest.Mocked<Repository<LandNFT>>;
  let blockchainService: jest.Mocked<BlockchainService>;

  const mockLandNftRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockBlockchainService = {
    getNftOwner: jest.fn(),
    getNftTokenUri: jest.fn(),
    getLandNftEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: getRepositoryToken(LandNFT),
          useValue: mockLandNftRepository,
        },
        {
          provide: getRepositoryToken(LandRecord),
          useValue: {},
        },
        {
          provide: getRepositoryToken(LandFile),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BlockchainLog),
          useValue: {},
        },
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: IPFS_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
    landNftRepository = module.get(getRepositoryToken(LandNFT));
    blockchainService = module.get(BlockchainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyNft', () => {
    it('should return isVerified = false when token does not exist on-chain and in DB', async () => {
      blockchainService.getNftOwner.mockRejectedValue(new Error('ERC721: invalid token ID'));
      blockchainService.getNftTokenUri.mockRejectedValue(new Error('ERC721: invalid token ID'));
      landNftRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyNft('https://landregistry.gov.vn/verify/1');

      expect(result.tokenId).toBe('1');
      expect(result.isVerified).toBe(false);
      expect(result.message).toContain('Không tìm thấy thông tin NFT');
      expect(result.blockchain).toBeNull();
      expect(result.database).toBeNull();
    });

    it('should return isVerified = false when token exists in DB but not on-chain', async () => {
      blockchainService.getNftOwner.mockRejectedValue(new Error('ERC721: invalid token ID'));
      blockchainService.getNftTokenUri.mockRejectedValue(new Error('ERC721: invalid token ID'));
      
      const mockDbNft = {
        tokenId: '1',
        ownerWallet: '0x123',
        metadataUri: 'ipfs://Qm123',
        status: 'Normal',
        recordId: 101,
        record: {
          address: '123 ABC',
          area: '100',
          owner: { fullName: 'Nguyen Van A' },
        },
      };
      landNftRepository.findOne.mockResolvedValue(mockDbNft as any);

      const result = await service.verifyNft('1');

      expect(result.tokenId).toBe('1');
      expect(result.isVerified).toBe(false);
      expect(result.message).toContain('chưa được đồng bộ hoặc không tồn tại trên Blockchain');
      expect(result.database).toBeDefined();
      expect(result.blockchain).toBeNull();
    });

    it('should return isVerified = true when database and on-chain values match', async () => {
      blockchainService.getNftOwner.mockResolvedValue('0x123');
      blockchainService.getNftTokenUri.mockResolvedValue('ipfs://Qm123');

      const mockDbNft = {
        tokenId: '1',
        ownerWallet: '0x123',
        metadataUri: 'ipfs://Qm123',
        status: 'Normal',
        recordId: 101,
        record: {
          address: '123 ABC',
          area: '100',
          owner: { fullName: 'Nguyen Van A' },
        },
      };
      landNftRepository.findOne.mockResolvedValue(mockDbNft as any);

      const result = await service.verifyNft('1');

      expect(result.isVerified).toBe(true);
      expect(result.comparison.ownerMatches).toBe(true);
      expect(result.comparison.metadataMatches).toBe(true);
      expect(result.message).toContain('Xác thực thành công');
    });

    it('should return isVerified = false with warning if owner mismatch', async () => {
      blockchainService.getNftOwner.mockResolvedValue('0xOnChainOwner');
      blockchainService.getNftTokenUri.mockResolvedValue('ipfs://Qm123');

      const mockDbNft = {
        tokenId: '1',
        ownerWallet: '0xDbOwner',
        metadataUri: 'ipfs://Qm123',
        status: 'Normal',
        recordId: 101,
        record: {
          address: '123 ABC',
          area: '100',
          owner: { fullName: 'Nguyen Van A' },
        },
      };
      landNftRepository.findOne.mockResolvedValue(mockDbNft as any);

      const result = await service.verifyNft('1');

      expect(result.isVerified).toBe(false);
      expect(result.comparison.ownerMatches).toBe(false);
      expect(result.comparison.metadataMatches).toBe(true);
      expect(result.message).toContain('Địa chỉ ví chủ sở hữu trên Blockchain không trùng khớp');
    });
  });

  describe('getProvenance', () => {
    it('should throw NotFoundException if token does not exist in DB', async () => {
      landNftRepository.findOne.mockResolvedValue(null);

      await expect(service.getProvenance('99')).rejects.toThrow(NotFoundException);
    });

    it('should return chronologically mapped events for a token', async () => {
      const mockDbNft = { tokenId: '1' };
      landNftRepository.findOne.mockResolvedValue(mockDbNft as any);

      const mockEvents = [
        {
          type: 'LandCreated',
          blockNumber: 1000,
          transactionHash: '0xTx1',
          timestamp: 1779999000,
          owner: '0xOwner1',
          metadataUri: 'ipfs://QmMeta',
        },
        {
          type: 'LandStatusChanged',
          blockNumber: 1001,
          transactionHash: '0xTx2',
          timestamp: 1779999100,
          oldStatus: 0, // KHOI_TAO
          newStatus: 1, // CHO_DUYET
        },
        {
          type: 'Transfer',
          blockNumber: 1002,
          transactionHash: '0xTx3',
          timestamp: 1779999200,
          from: '0xOwner1',
          to: '0xOwner2',
        },
      ];
      blockchainService.getLandNftEvents.mockResolvedValue(mockEvents);

      const result = await service.getProvenance('1');

      expect(result.tokenId).toBe('1');
      expect(result.events.length).toBe(3);
      
      expect(result.events[0].type).toBe('LandCreated');
      expect(result.events[0].description).toContain('được số hóa thành công');
      expect(result.events[0].timestamp).toBe(new Date(1779999000 * 1000).toISOString());

      expect(result.events[1].type).toBe('LandStatusChanged');
      expect(result.events[1].description).toContain('Khởi tạo] sang [Chờ duyệt');
      expect(result.events[1].oldStatus).toBe('KHOI_TAO');
      expect(result.events[1].newStatus).toBe('CHO_DUYET');

      expect(result.events[2].type).toBe('Transfer');
      expect(result.events[2].description).toContain('Chuyển quyền sở hữu');
      expect(result.events[2].from).toBe('0xOwner1');
      expect(result.events[2].to).toBe('0xOwner2');
    });
  });
});
