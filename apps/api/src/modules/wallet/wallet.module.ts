import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { Wallet } from '../database/entities/wallet.entity';
import { WalletSecret } from '../database/entities/wallet-secret.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { User } from '../database/entities/user.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { LandNFT } from '../database/entities/land-nft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletSecret, WalletRecoveryRequest, User, LandNFT]),
    forwardRef(() => AuthModule), // Provides AuthGuard + JwtModule
    RedisModule,
    BlockchainModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
