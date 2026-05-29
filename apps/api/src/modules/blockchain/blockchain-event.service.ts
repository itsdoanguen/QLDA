import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { BlockchainService } from './blockchain.service';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { CachedProvenanceLog } from '../database/entities/cached-provenance-log.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';

@Injectable()
export class BlockchainEventService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainEventService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(LandRecord)
    private readonly landRecordRepo: Repository<LandRecord>,
    @InjectRepository(LandNFT)
    private readonly landNftRepo: Repository<LandNFT>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(BlockchainLog)
    private readonly blockchainLogRepo: Repository<BlockchainLog>,
    @InjectRepository(CachedProvenanceLog)
    private readonly provenanceLogRepo: Repository<CachedProvenanceLog>,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Blockchain Event Listeners...');
    this.registerListeners();
  }

  private async ensureBlockchainLog(eventLog: any, eventName: string): Promise<string | null> {
    const txHash = eventLog.transactionHash;
    if (!txHash) return null;

    let log = await this.blockchainLogRepo.findOne({ where: { txHash } });
    if (!log) {
      try {
        const provider = (this.blockchainService as any).provider;
        if (provider) {
          const receipt = await provider.getTransactionReceipt(txHash);
          const block = await provider.getBlock(receipt.blockNumber);
          
          let gasFee: string | undefined = undefined;
          try {
            const gasUsed = BigInt(receipt.gasUsed.toString());
            const gasPriceSource = receipt.effectiveGasPrice ?? receipt.gasPrice ?? 0;
            const gasPrice = gasPriceSource ? BigInt(gasPriceSource.toString()) : 0n;
            if (gasUsed > 0n && gasPrice > 0n) {
              const wei = gasUsed * gasPrice;
              gasFee = ethers.formatEther(wei); // string in ETH
            }
          } catch (e) {
            this.logger.warn('Unable to compute gas fee from receipt', e as any);
            gasFee = undefined;
          }

          log = this.blockchainLogRepo.create({
            txHash,
            actionType: eventName,
            gasFee,
            status: receipt.status === 1 ? 'Success' : 'Reverted',
            timestamp: new Date(block.timestamp * 1000),
          });
          await this.blockchainLogRepo.save(log);
          this.logger.log(`Created BlockchainLog for tx ${txHash}`);
        }
      } catch (error) {
        this.logger.error(`Error fetching receipt for tx ${txHash}:`, error);
      }
    }
    return txHash;
  }

  private async createProvenanceLog(eventName: string, tokenId: string, eventDataObj: any, eventLog: any) {
    const txHash = await this.ensureBlockchainLog(eventLog, eventName);
    if (!txHash) return;

    try {
      const cachedLog = this.provenanceLogRepo.create({
        tokenId,
        eventType: eventName,
        eventData: JSON.stringify(eventDataObj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ),
        txHash,
        blockNumber: eventLog.blockNumber,
      });
      await this.provenanceLogRepo.save(cachedLog);
      this.logger.log(`Created CachedProvenanceLog for ${eventName} on token ${tokenId}`);
    } catch (error) {
      this.logger.error(`Error saving provenance log for token ${tokenId}:`, error);
    }
  }

  private registerListeners() {
    // 1. LandCreated
    this.blockchainService.registerEventSyncHook('LandCreated', async (data) => {
      const [tokenIdBigInt, to, tokenURI] = data.args;
      const tokenId = tokenIdBigInt.toString();
      this.logger.log(`Received LandCreated event: tokenId=${tokenId}, to=${to}`);
      
      const nft = await this.landNftRepo.findOne({ where: { tokenId } });
      if (nft) {
        nft.status = 'Normal';
        nft.ownerWallet = to;
        await this.landNftRepo.save(nft);
        this.logger.log(`Updated LandNFT ${tokenId} status to Normal`);
      }

      await this.createProvenanceLog('LandCreated', tokenId, { to, tokenURI }, data.eventLog);
    });

    // 2. LandStatusChanged
    this.blockchainService.registerEventSyncHook('LandStatusChanged', async (data) => {
      const [tokenIdBigInt, oldStatus, newStatus] = data.args;
      const tokenId = tokenIdBigInt.toString();
      this.logger.log(`Received LandStatusChanged event: tokenId=${tokenId}, newStatus=${newStatus}`);
      
      const nft = await this.landNftRepo.findOne({ where: { tokenId } });
      if (nft) {
        let dbStatus = 'Normal';
        const numStatus = Number(newStatus);
        if (numStatus === 3) dbStatus = 'Trading';
        else if (numStatus === 4 || numStatus === 5) dbStatus = 'Locked';
        
        nft.status = dbStatus;
        await this.landNftRepo.save(nft);
        this.logger.log(`Updated LandNFT ${tokenId} status to ${dbStatus}`);
      }

      await this.createProvenanceLog('LandStatusChanged', tokenId, { oldStatus, newStatus }, data.eventLog);
    });

    // 3. TransactionSigned (MultiSigWorkflow)
    this.blockchainService.registerMultiSigSyncHook('TransactionSigned', async (data) => {
      const [transactionIdBigInt, signer, role, isApproved] = data.args;
      const txId = Number(transactionIdBigInt);
      this.logger.log(`Received TransactionSigned event: txId=${txId}, signer=${signer}, approved=${isApproved}`);
      
      // We don't have a specific tokenId for this event natively, so we pass null or empty 
      // But we will ensure BlockchainLog is created.
      await this.ensureBlockchainLog(data.eventLog, 'TransactionSigned');
    });

    // 4. RecoveryApproved (WalletOverride)
    this.blockchainService.registerWalletOverrideSyncHook('RecoveryApproved', async (data) => {
      const [requestIdBigInt, citizenIdHash, newWallet] = data.args;
      const reqId = Number(requestIdBigInt);
      this.logger.log(`Received RecoveryApproved event: reqId=${reqId}, citizen=${citizenIdHash}, newWallet=${newWallet}`);
      
      await this.ensureBlockchainLog(data.eventLog, 'RecoveryApproved');
    });

    // 5. TaxPaid (from EContract)
    this.blockchainService.registerEContractSyncHook('TaxPaid', async (data) => {
      const [contractIdBigInt, taxTNCN, feePreBa] = data.args;
      const contractId = Number(contractIdBigInt);
      this.logger.log(`Received TaxPaid event: contractId=${contractId}, taxTNCN=${taxTNCN}, feePreBa=${feePreBa}`);
      
      try {
        if (this.blockchainService.eContractContract) {
          const purchaseContract = await this.blockchainService.eContractContract.getContract(contractIdBigInt);
          const tokenId = purchaseContract.tokenId.toString();
          
          await this.createProvenanceLog(
            'TaxPaid', 
            tokenId, 
            { contractId, taxTNCN: taxTNCN.toString(), feePreBa: feePreBa.toString() }, 
            data.eventLog
          );
        }
      } catch (error) {
        this.logger.error(`Error processing TaxPaid event for contractId ${contractId}:`, error);
        await this.ensureBlockchainLog(data.eventLog, 'TaxPaid');
      }
    });

    // 6. ReceiptRecorded (from Receipt contract)
    this.blockchainService.registerReceiptSyncHook('ReceiptRecorded', async (data) => {
      const [txHashBytes, payer, amount, receiptCID, timestamp] = data.args;
      const txHash = txHashBytes;
      this.logger.log(`Received ReceiptRecorded event: tx=${txHash}, payer=${payer}, amount=${amount.toString()}, cid=${receiptCID}`);

      // Ensure BlockchainLog is created for this receipt tx
      await this.ensureBlockchainLog(data.eventLog, 'ReceiptRecorded');
    });

    // 7. Transfer (from LandNFT)
    this.blockchainService.registerNftSyncHook('Transfer', async (data) => {
      const [from, to, tokenIdBigInt] = data.args;
      const tokenId = tokenIdBigInt.toString();
      this.logger.log(`Received Transfer event: tokenId=${tokenId}, from=${from}, to=${to}`);

      // Optional: don't sync if it's the zero address (minting), since LandCreated handles it
      if (from === '0x0000000000000000000000000000000000000000') {
        return;
      }

      // Update LandNFT ownerWallet
      const nft = await this.landNftRepo.findOne({ where: { tokenId } });
      if (nft) {
        nft.ownerWallet = to;
        await this.landNftRepo.save(nft);
        this.logger.log(`Updated LandNFT ${tokenId} ownerWallet to ${to}`);

        // Try to sync LandRecord ownerId if user exists
        const userWallet = await this.walletRepo.findOne({ where: { walletAddress: to } });
        if (userWallet) {
          const record = await this.landRecordRepo.findOne({ where: { id: nft.recordId } });
          if (record) {
            record.ownerId = userWallet.userId;
            await this.landRecordRepo.save(record);
            this.logger.log(`Updated LandRecord ${record.id} ownerId to ${userWallet.userId}`);
          }
        } else {
          this.logger.warn(`No user found with wallet ${to}, skipping LandRecord owner sync.`);
        }
      }

      await this.createProvenanceLog('Transfer', tokenId, { from, to }, data.eventLog);
    });
  }
}
