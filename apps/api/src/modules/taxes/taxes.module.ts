import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxFee } from '../database/entities/tax-fee.entity';
import { Receipt } from '../database/entities/receipt.entity';
import { LandRecord } from '../database/entities/land-record.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { SystemConfig } from '../database/entities/system-config.entity';
import { TaxesController } from './taxes.controller';
import { TaxesService } from './taxes.service';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';

import { Wallet } from '../database/entities/wallet.entity';
import { LandNFT } from '../database/entities/land-nft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxFee, Receipt, LandRecord, Transaction, SystemConfig, Wallet, LandNFT]),
    AuthModule,
    BlockchainModule,
    IpfsModule,
  ],
  controllers: [TaxesController],
  providers: [TaxesService],
  exports: [TaxesService],
})
export class TaxesModule {}
