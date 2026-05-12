import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '../database/entities/system-config.entity';
import { SystemConfigAudit } from '../database/entities/system-config-audit.entity';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, SystemConfigAudit])],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
