import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { ApprovalRequest } from '../database/entities/approval-request.entity';
import { Signature } from '../database/entities/signature.entity';
import { User } from '../database/entities/user.entity';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandRecord, ApprovalRequest, Signature, User]),
    AuthModule,
    BlockchainModule,
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
