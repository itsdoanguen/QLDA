import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { SmartContract } from '../database/entities/smart-contract.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandRecord, LandNFT, Wallet, BlockchainLog, SmartContract, LandFile]),
    AuthModule,
    BlockchainModule,
    IpfsModule,
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
