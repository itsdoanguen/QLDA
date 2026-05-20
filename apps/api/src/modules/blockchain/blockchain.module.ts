import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { BlockchainEventService } from './blockchain-event.service';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { CachedProvenanceLog } from '../database/entities/cached-provenance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandRecord, LandNFT, Wallet, Transaction,
      BlockchainLog, CachedProvenanceLog
    ])
  ],
  providers: [BlockchainService, BlockchainEventService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
