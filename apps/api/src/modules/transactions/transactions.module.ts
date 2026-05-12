import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, LandNFT, Wallet]),
    ComplianceModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
