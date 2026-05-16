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
