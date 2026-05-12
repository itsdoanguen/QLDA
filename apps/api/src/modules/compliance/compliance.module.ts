import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute } from '../database/entities/dispute.entity';
import { Mortgage } from '../database/entities/mortgage.entity';
import { PlanningZone } from '../database/entities/planning-zone.entity';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dispute, Mortgage, PlanningZone])],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
