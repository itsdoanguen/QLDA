import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandRecord, LandNFT, Wallet, BlockchainLog]),
    AuthModule,
    BlockchainModule,
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
