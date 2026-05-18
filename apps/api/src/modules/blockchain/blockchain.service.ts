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
}
