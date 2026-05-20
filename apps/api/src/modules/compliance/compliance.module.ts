import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute } from '../database/entities/dispute.entity';
import { Mortgage } from '../database/entities/mortgage.entity';
import { PlanningZone } from '../database/entities/planning-zone.entity';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute, Mortgage, PlanningZone]),
    AuthModule,
    BlockchainModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
