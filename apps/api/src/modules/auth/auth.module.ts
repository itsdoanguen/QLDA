import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { VneidModule } from '../vneid/vneid.module';
import { RedisModule } from '../redis/redis.module';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({}), // Secrets are loaded via ConfigService dynamically
    VneidModule,
    RedisModule,
    forwardRef(() => WalletModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
