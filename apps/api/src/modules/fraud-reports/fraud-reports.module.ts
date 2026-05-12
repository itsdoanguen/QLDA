import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudReport } from '../database/entities/fraud-report.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { FraudReportsController } from './fraud-reports.controller';
import { FraudReportsService } from './fraud-reports.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FraudReport, LandNFT]),
    AuthModule,
  ],
  controllers: [FraudReportsController],
  providers: [FraudReportsService],
})
export class FraudReportsModule { }
