import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './blockchain.service';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { Transaction } from '../database/entities/transaction.entity';
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
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Blockchain Event Listeners...');
    this.registerListeners();
  }

  private registerListeners() {
    // 1. LandCreated or LandNFTMinted
    this.blockchainService.registerEventSyncHook('LandNFTMinted', async (data) => {
      const [tokenIdBigInt, to, tokenURI] = data.args;
      const tokenId = tokenIdBigInt.toString();
      this.logger.log(`Received LandNFTMinted event: tokenId=${tokenId}, to=${to}`);
      
      // Update the NFT status if it exists, or just log
      const nft = await this.landNftRepo.findOne({ where: { tokenId } });
      if (nft) {
        nft.status = 'Normal';
        nft.ownerWallet = to;
        await this.landNftRepo.save(nft);
        this.logger.log(`Updated LandNFT ${tokenId} status to Normal`);
      }
    });

    // 2. LandStatusChanged
    this.blockchainService.registerEventSyncHook('LandStatusChanged', async (data) => {
      const [tokenIdBigInt, oldStatus, newStatus] = data.args;
      const tokenId = tokenIdBigInt.toString();
      this.logger.log(`Received LandStatusChanged event: tokenId=${tokenId}, newStatus=${newStatus}`);
      
      const nft = await this.landNftRepo.findOne({ where: { tokenId } });
      if (nft) {
        // Map on-chain status to DB NFT status
        // 2: DA_CAP_SO (Normal), 3: DANG_GIAO_DICH (Trading)
        // 4: THE_CHAP (Locked), 5: TRANH_CHAP (Locked), 6: CHUYEN_NHUONG (Normal)
        let dbStatus = 'Normal';
        const numStatus = Number(newStatus);
        if (numStatus === 3) dbStatus = 'Trading';
        else if (numStatus === 4 || numStatus === 5) dbStatus = 'Locked';
        
        nft.status = dbStatus;
        await this.landNftRepo.save(nft);
        this.logger.log(`Updated LandNFT ${tokenId} status to ${dbStatus}`);
      }
    });

    // 3. TransactionSigned
    this.blockchainService.registerEventSyncHook('TransactionSigned', async (data) => {
      const [transactionIdBigInt, signer, role, isApproved] = data.args;
      const txId = Number(transactionIdBigInt);
      this.logger.log(`Received TransactionSigned event: txId=${txId}, signer=${signer}, approved=${isApproved}`);
      
      // We could update a MultiSig request or Approval table here.
      // Assuming Transaction entity represents the sale transaction, 
      // MultiSig transactions might be separate, but we log the event.
    });

    // 4. RecoveryApproved
    this.blockchainService.registerEventSyncHook('RecoveryApproved', async (data) => {
      const [requestIdBigInt, citizenIdHash, newWallet] = data.args;
      const reqId = Number(requestIdBigInt);
      this.logger.log(`Received RecoveryApproved event: reqId=${reqId}, citizen=${citizenIdHash}, newWallet=${newWallet}`);
      
      // We could update the user's wallet address in the Wallet table.
      // To do this reliably, we'd need to find the user by citizenIdHash, 
      // but if we just have the wallet table we can check by old wallet or user.
      // This serves as an automated sync hook.
      // Since we don't store citizenIdHash directly in Wallet, we might need a mapping,
      // but for now we'll just log it. 
      // If we find a way to map citizenIdHash to userId, we would update it here.
    });
  }
}
