import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SystemLog } from '../database/entities/system-log.entity';
import { AuditService } from './audit.service';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog])],
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
