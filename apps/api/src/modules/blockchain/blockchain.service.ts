import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnv } from '../../config/env/env.schema';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  public landRegistryContract: ethers.Contract;
  public landNFTContract: ethers.Contract;
  public multiSigContract: ethers.Contract;
  public walletOverrideContract: ethers.Contract;
  public auditLogContract: ethers.Contract;
  public eContractContract: ethers.Contract;
  public receiptContract: ethers.Contract;
  public accessControlContract: ethers.Contract;
  public planningRegistryContract: ethers.Contract;

  constructor(private configService: ConfigService<AppEnv>) {
    this.initProvider();
  }

  private initProvider() {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const chainId = this.configService.get<number>('CHAIN_ID');
    this.logger.log(`Initializing Blockchain Provider for RPC: ${rpcUrl}, ChainId: ${chainId}`);
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    
    // Fallback to a hardhat test private key if not provided in env for local testing
    const privateKey = process.env.SIGNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    this.signer = new ethers.Wallet(privateKey, this.provider);

    const registryAddress = this.configService.get<string>('LAND_REGISTRY_CONTRACT_ADDRESS');
    const nftAddress = this.configService.get<string>('LAND_NFT_CONTRACT_ADDRESS');
    const multiSigAddress = this.configService.get<string>('MULTI_SIG_CONTRACT_ADDRESS');

    if (registryAddress) {
      const registryAbi = this.getAbiLoader('LandRegistry');
      this.landRegistryContract = new ethers.Contract(registryAddress, registryAbi, this.signer);
      this.logger.log(`Initialized LandRegistry contract at: ${registryAddress}`);
    }

    if (nftAddress) {
      const nftAbi = this.getAbiLoader('LandNFT');
      this.landNFTContract = new ethers.Contract(nftAddress, nftAbi, this.signer);
      this.logger.log(`Initialized LandNFT contract at: ${nftAddress}`);
    }

    if (multiSigAddress) {
      const multiSigAbi = this.getAbiLoader('MultiSigWorkflow');
      this.multiSigContract = new ethers.Contract(multiSigAddress, multiSigAbi, this.signer);
      this.logger.log(`Initialized MultiSigWorkflow contract at: ${multiSigAddress}`);
    }

    const walletOverrideAddress = this.configService.get<string>('WALLET_OVERRIDE_CONTRACT_ADDRESS');
    if (walletOverrideAddress) {
      const walletOverrideAbi = this.getAbiLoader('WalletOverride');
      this.walletOverrideContract = new ethers.Contract(walletOverrideAddress, walletOverrideAbi, this.signer);
      this.logger.log(`Initialized WalletOverride contract at: ${walletOverrideAddress}`);
    }

    const auditLogAddress = this.configService.get<string>('AUDIT_LOG_CONTRACT_ADDRESS');
    if (auditLogAddress) {
      const auditLogAbi = this.getAbiLoader('AuditLog');
      this.auditLogContract = new ethers.Contract(auditLogAddress, auditLogAbi, this.signer);
      this.logger.log(`Initialized AuditLog contract at: ${auditLogAddress}`);
    }

    const eContractAddress = this.configService.get<string>('ECONTRACT_CONTRACT_ADDRESS');
    if (eContractAddress) {
      const eContractAbi = this.getAbiLoader('EContract');
      this.eContractContract = new ethers.Contract(eContractAddress, eContractAbi, this.signer);
      this.logger.log(`Initialized EContract contract at: ${eContractAddress}`);
    }

    const receiptAddress = this.configService.get<string>('RECEIPT_CONTRACT_ADDRESS');
    if (receiptAddress) {
      const receiptAbi = this.getAbiLoader('Receipt');
      this.receiptContract = new ethers.Contract(receiptAddress, receiptAbi, this.signer);
      this.logger.log(`Initialized Receipt contract at: ${receiptAddress}`);
    }

    const accessControlAddress = this.configService.get<string>('ACCESS_CONTROL_CONTRACT_ADDRESS');
    if (accessControlAddress) {
      const accessControlAbi = this.getAbiLoader('AccessControl');
      this.accessControlContract = new ethers.Contract(accessControlAddress, accessControlAbi, this.signer);
      this.logger.log(`Initialized AccessControl contract at: ${accessControlAddress}`);
    }

    const planningRegistryAddress = this.configService.get<string>('PLANNING_REGISTRY_CONTRACT_ADDRESS');
    if (planningRegistryAddress) {
      const planningAbi = this.getAbiLoader('PlanningRegistry');
      this.planningRegistryContract = new ethers.Contract(planningRegistryAddress, planningAbi, this.signer);
      this.logger.log(`Initialized PlanningRegistry contract at: ${planningRegistryAddress}`);
    }
  }

  public getAbiLoader(contractName: string): any {
    this.logger.log(`Loading ABI for contract: ${contractName}`);
    try {
      const artifactPath = path.resolve(
        __dirname,
        '../../../../blockchain/artifacts/contracts',
        `${contractName}.sol`,
        `${contractName}.json`
      );
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    } catch (error) {
      this.logger.error(`Failed to load ABI for ${contractName}:`, error);
      return [];
    }
  }

  public async submitTransaction(txPayload: any): Promise<string> {
    this.logger.log(`Submitting generic tx payload (deprecated): ${JSON.stringify(txPayload)}`);
    return "deprecated";
  }

  public async trackTxLifecycle(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    this.logger.log(`Tracking tx: ${txHash}`);
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return 'pending';
      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      this.logger.error(`Error tracking tx ${txHash}:`, error);
      return 'failed';
    }
  }

  public async mintNFT(ownerAddress: string, metadataUrl: string): Promise<{ tokenId: string, txHash: string }> {
    this.logger.log(`Minting NFT for ${ownerAddress} with metadata ${metadataUrl}`);
    if (!this.landRegistryContract) {
      throw new Error("LandRegistry contract is not initialized");
    }

    try {
      const tx = await this.landRegistryContract.createLandRecord(ownerAddress, metadataUrl);
      const receipt = await tx.wait();
      
      let tokenId = "unknown";
      
      // Try to parse logs to find the LandCreated event and extract tokenId
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = this.landRegistryContract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'LandCreated') {
              tokenId = parsedLog.args[0].toString();
              break;
            }
          } catch (e) {
            // Ignore parsing errors for other logs
          }
        }
      }

      return {
        tokenId,
        txHash: tx.hash,
      };
    } catch (error) {
      this.logger.error(`Failed to mint NFT on-chain:`, error);
      throw error;
    }
  }

  public async transferNFT(from: string, to: string, tokenId: string): Promise<string> {
    this.logger.log(`Transferring NFT ${tokenId} from ${from} to ${to} on-chain`);
    if (!this.landNFTContract) {
      throw new Error("LandNFT contract is not initialized");
    }
    
    // Using adminTransfer since backend is the owner of the contract 
    // and standard transferFrom requires prior user approval on-chain.
    const tx = await this.landNFTContract.adminTransfer(from, to, tokenId);
    await tx.wait();
    return tx.hash;
  }

  // --- Task A3: State Machine Transitions ---

  public async submitForApproval(tokenId: string): Promise<string> {
    this.logger.log(`Calling submitForApproval on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.submitForApproval(tokenId);
    await tx.wait();
    return tx.hash;
  }

  public async approveLand(tokenId: string): Promise<string> {
    this.logger.log(`Calling approveLand on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.approveLand(tokenId);
    await tx.wait();
    return tx.hash;
  }

  public async rejectLand(tokenId: string, reason: string): Promise<string> {
    this.logger.log(`Calling rejectLand on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.rejectLand(tokenId, reason);
    await tx.wait();
    return tx.hash;
  }

  public async startTransaction(tokenId: string): Promise<string> {
    this.logger.log(`Calling startTransaction on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.startTransaction(tokenId);
    await tx.wait();
    return tx.hash;
  }

  public async cancelTransaction(tokenId: string): Promise<string> {
    this.logger.log(`Calling cancelTransaction on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.cancelTransaction(tokenId);
    await tx.wait();
    return tx.hash;
  }

  public async completeTransfer(tokenId: string): Promise<string> {
    this.logger.log(`Calling completeTransfer on-chain for token ${tokenId}`);
    const tx = await this.landRegistryContract.completeTransfer(tokenId);
    await tx.wait();
    return tx.hash;
  }

  // --- Task A4: Multi-sig Transitions ---

  public async getOrCreateMultiSigTx(documentCID: string): Promise<number> {
    this.logger.log(`Getting or creating MultiSig transaction for documentCID: ${documentCID}`);
    if (!this.multiSigContract) throw new Error("MultiSig contract not initialized");

    // Fetch existing events to see if it's already created
    const filter = this.multiSigContract.filters.TransactionCreated();
    const events = await this.multiSigContract.queryFilter(filter);
    
    for (const event of events) {
      const args = (event as any).args;
      if (args && args[1] === documentCID) {
        return Number(args[0]);
      }
    }

    // If not found, create it
    const tx = await this.multiSigContract.createTransaction(documentCID);
    const receipt = await tx.wait();
    
    // Parse logs
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.multiSigContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TransactionCreated') {
            return Number(parsedLog.args[0]);
          }
        } catch (e) {}
      }
    }
    
    throw new Error("Failed to create MultiSig transaction");
  }

  public async signMultiSig(txId: number, isApproved: boolean, reason: string): Promise<string> {
    this.logger.log(`Signing MultiSig tx ${txId}: approved=${isApproved}`);
    if (!this.multiSigContract) throw new Error("MultiSig contract not initialized");
    const tx = await this.multiSigContract.signTransaction(txId, isApproved, reason || '');
    await tx.wait();
    return tx.hash;
  }

  public async batchSignMultiSig(txIds: number[], isApproved: boolean[], reasons: string[]): Promise<string> {
    this.logger.log(`Batch signing MultiSig txs: count=${txIds.length}`);
    if (!this.multiSigContract) throw new Error("MultiSig contract not initialized");
    const tx = await this.multiSigContract.batchSignTransactions(txIds, isApproved, reasons);
    await tx.wait();
    return tx.hash;
  }

  // --- BC-5: Revoke / Revert Signatures ---

  public async revokeMySignature(txId: number): Promise<string> {
    this.logger.log(`Revoking my signature for multisig tx ${txId}`);
    if (!this.multiSigContract) throw new Error("MultiSig contract not initialized");
    const tx = await this.multiSigContract.revokeMySignature(txId);
    await tx.wait();
    return tx.hash;
  }

  public async adminRevertTransaction(txId: number): Promise<string> {
    this.logger.log(`Admin reverting multisig tx ${txId} to PENDING`);
    if (!this.multiSigContract) throw new Error("MultiSig contract not initialized");
    const tx = await this.multiSigContract.adminRevertTransaction(txId);
    await tx.wait();
    return tx.hash;
  }

  // --- Task A7: Wallet Override ---

  public async requestWalletOverride(citizenIdHash: string, newWallet: string): Promise<number> {
    this.logger.log(`Requesting wallet override on-chain for citizen ${citizenIdHash}`);
    if (!this.walletOverrideContract) throw new Error("WalletOverride contract not initialized");
    
    const tx = await this.walletOverrideContract.requestWalletOverride(citizenIdHash, newWallet);
    const receipt = await tx.wait();
    
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.walletOverrideContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'RecoveryRequested') {
            return Number(parsedLog.args[0]);
          }
        } catch (e) {}
      }
    }
    throw new Error("Failed to get requestId from RecoveryRequested event");
  }

  public async approveWalletOverride(requestId: number, tokenIds: string[]): Promise<string> {
    this.logger.log(`Approving wallet override on-chain for requestId ${requestId}`);
    if (!this.walletOverrideContract) throw new Error("WalletOverride contract not initialized");
    
    const tx = await this.walletOverrideContract.approveWalletOverride(requestId, tokenIds);
    await tx.wait();
    return tx.hash;
  }

  public async rejectWalletOverride(requestId: number, reason: string): Promise<string> {
    this.logger.log(`Rejecting wallet override on-chain for requestId ${requestId}`);
    if (!this.walletOverrideContract) throw new Error("WalletOverride contract not initialized");
    
    const tx = await this.walletOverrideContract.rejectWalletOverride(requestId, reason);
    await tx.wait();
    return tx.hash;
  }

  // --- Task A8: Audit Log ---
  public async recordLogHash(logHash: string): Promise<string> {
    this.logger.log(`Recording audit log hash on-chain: ${logHash}`);
    if (!this.auditLogContract) throw new Error("AuditLog contract not initialized");
    
    const tx = await this.auditLogContract.recordLogHash(logHash);
    await tx.wait();
    return tx.hash;
  }

  // --- Task A9: Pre-check ---
  public async canTransact(tokenId: string): Promise<boolean> {
    this.logger.log(`Checking canTransact on-chain for token ${tokenId}`);
    if (!this.landRegistryContract) throw new Error("LandRegistry contract not initialized");
    return this.landRegistryContract.canTransact(tokenId);
  }

  public async isBlocked(tokenId: string): Promise<boolean> {
    this.logger.log(`Checking isBlocked on-chain for token ${tokenId}`);
    if (!this.landRegistryContract) throw new Error("LandRegistry contract not initialized");
    return this.landRegistryContract.isBlocked(tokenId);
  }

  public async getLandMetadata(tokenId: string): Promise<string> {
    this.logger.log(`Fetching metadata URI on-chain for token ${tokenId}`);
    if (!this.landRegistryContract) throw new Error('LandRegistry contract is not initialized');
    return await this.landRegistryContract.getLandMetadata(tokenId);
  }

  public async isTokenInDangerZone(tokenId: string): Promise<boolean> {
    this.logger.log(`Checking planning danger zone for token ${tokenId}`);
    if (!this.planningRegistryContract) throw new Error('PlanningRegistry contract is not initialized');
    return await this.planningRegistryContract.isTokenInDanger(tokenId);
  }

  public async getNftOwner(tokenId: string): Promise<string> {
    this.logger.log(`Querying ownerOf on-chain for token ${tokenId}`);
    if (!this.landNFTContract) throw new Error('LandNFT contract is not initialized');
    return await this.landNFTContract.ownerOf(tokenId);
  }

  public async getNftTokenUri(tokenId: string): Promise<string> {
    this.logger.log(`Querying tokenURI on-chain for token ${tokenId}`);
    if (!this.landNFTContract) throw new Error('LandNFT contract is not initialized');
    return await this.landNFTContract.tokenURI(tokenId);
  }

  public registerEventSyncHook(eventName: string, callback: (eventData: any) => void) {
    this.logger.log(`Registering sync hook for event: ${eventName}`);
    if (this.landRegistryContract) {
      this.landRegistryContract.on(eventName, (...args) => {
        // Last argument in ethers v6 event callback is the EventLog object
        const eventLog = args[args.length - 1];
        callback({ args: args.slice(0, args.length - 1), eventLog });
      });
    }
  }

  public registerEContractSyncHook(eventName: string, callback: (eventData: any) => void) {
    this.logger.log(`Registering EContract sync hook for event: ${eventName}`);
    if (this.eContractContract) {
      this.eContractContract.on(eventName, (...args) => {
        // Last argument in ethers v6 event callback is the EventLog object
        const eventLog = args[args.length - 1];
        callback({ args: args.slice(0, args.length - 1), eventLog });
      });
    }
  }

  public registerReceiptSyncHook(eventName: string, callback: (eventData: any) => void) {
    this.logger.log(`Registering Receipt sync hook for event: ${eventName}`);
    if (this.receiptContract) {
      this.receiptContract.on(eventName, (...args) => {
        const eventLog = args[args.length - 1];
        callback({ args: args.slice(0, args.length - 1), eventLog });
      });
    }
  }

  public async recordReceipt(txHash: string, payer: string, amountWei: string | number | bigint, receiptCID: string): Promise<string> {
    this.logger.log(`Recording receipt on-chain for tx ${txHash}, payer ${payer}, amount ${amountWei}`);
    if (!this.receiptContract) throw new Error('Receipt contract not initialized');
    // txHash is expected to be bytes32 hex string (0x...)
    const tx = await this.receiptContract.recordReceipt(txHash, payer, BigInt(amountWei.toString()), receiptCID);
    await tx.wait();
    return tx.hash;
  }

  public async getReceipt(txHash: string): Promise<{ payer: string; amount: string; receiptCID: string; timestamp: number }> {
    this.logger.log(`Fetching receipt on-chain for tx ${txHash}`);
    if (!this.receiptContract) throw new Error('Receipt contract not initialized');
    const res = await this.receiptContract.getReceipt(txHash);
    // res: [payer, amount, receiptCID, timestamp]
    return {
      payer: res[0],
      amount: res[1].toString(),
      receiptCID: res[2],
      timestamp: Number(res[3]),
    };
  }

  public async getLandNftEvents(tokenId: string): Promise<any[]> {
    this.logger.log(`Querying events for tokenId ${tokenId}`);
    if (!this.landRegistryContract || !this.landNFTContract) {
      throw new Error("Blockchain contracts not fully initialized");
    }

    const tokenIdBigInt = BigInt(tokenId);

    const statusChangedFilter = this.landRegistryContract.filters.LandStatusChanged(tokenIdBigInt);
    const landCreatedFilter = this.landRegistryContract.filters.LandCreated(tokenIdBigInt);
    const transferFilter = this.landNFTContract.filters.Transfer(null, null, tokenIdBigInt);

    const [statusEvents, createdEvents, transferEvents] = await Promise.all([
      this.landRegistryContract.queryFilter(statusChangedFilter),
      this.landRegistryContract.queryFilter(landCreatedFilter),
      this.landNFTContract.queryFilter(transferFilter),
    ]);

    const allEvents: any[] = [];
    const blockCache = new Map<number, number>();

    const getBlockTimestamp = async (blockNumber: number): Promise<number> => {
      if (blockCache.has(blockNumber)) {
        return blockCache.get(blockNumber)!;
      }
      try {
        const block = await this.provider.getBlock(blockNumber);
        const ts = block ? block.timestamp : Math.floor(Date.now() / 1000);
        blockCache.set(blockNumber, ts);
        return ts;
      } catch (err) {
        this.logger.warn(`Failed to get block ${blockNumber}:`, err);
        return Math.floor(Date.now() / 1000);
      }
    };

    for (const event of createdEvents) {
      const eventLog = event as any;
      const timestamp = await getBlockTimestamp(eventLog.blockNumber);
      allEvents.push({
        type: 'LandCreated',
        blockNumber: eventLog.blockNumber,
        transactionHash: eventLog.transactionHash,
        transactionIndex: eventLog.transactionIndex ?? 0,
        logIndex: eventLog.index ?? 0,
        timestamp,
        owner: eventLog.args[1],
        metadataUri: eventLog.args[2],
      });
    }

    for (const event of statusEvents) {
      const eventLog = event as any;
      const timestamp = await getBlockTimestamp(eventLog.blockNumber);
      allEvents.push({
        type: 'LandStatusChanged',
        blockNumber: eventLog.blockNumber,
        transactionHash: eventLog.transactionHash,
        transactionIndex: eventLog.transactionIndex ?? 0,
        logIndex: eventLog.index ?? 0,
        timestamp,
        oldStatus: Number(eventLog.args[1]),
        newStatus: Number(eventLog.args[2]),
      });
    }

    for (const event of transferEvents) {
      const eventLog = event as any;
      const timestamp = await getBlockTimestamp(eventLog.blockNumber);
      allEvents.push({
        type: 'Transfer',
        blockNumber: eventLog.blockNumber,
        transactionHash: eventLog.transactionHash,
        transactionIndex: eventLog.transactionIndex ?? 0,
        logIndex: eventLog.index ?? 0,
        timestamp,
        from: eventLog.args[0],
        to: eventLog.args[1],
      });
    }

    allEvents.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }
      if (a.transactionIndex !== b.transactionIndex) {
        return a.transactionIndex - b.transactionIndex;
      }
      return a.logIndex - b.logIndex;
    });

    return allEvents;
  }
}
