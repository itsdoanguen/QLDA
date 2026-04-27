import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { Wallet } from '../database/entities/wallet.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletRecoveryRequest]),
    AuthModule, // Provides AuthGuard + JwtModule
    RedisModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
