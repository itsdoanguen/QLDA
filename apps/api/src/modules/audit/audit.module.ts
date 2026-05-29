import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SystemLog } from '../database/entities/system-log.entity';
import { AuditService } from './audit.service';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { BlockchainModule } from '../blockchain/blockchain.module';

import { AuditController } from './audit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemLog]),
    BlockchainModule
  ],
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
