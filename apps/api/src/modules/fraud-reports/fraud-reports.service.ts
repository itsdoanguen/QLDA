import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudReport } from '../database/entities/fraud-report.entity';
import { LandNFT } from '../database/entities/land-nft.entity';

@Injectable()
export class FraudReportsService {
  constructor(
    @InjectRepository(FraudReport)
    private readonly fraudReportRepository: Repository<FraudReport>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
  ) {}

  async createReport(tokenId: string, reporterId: number, reportType: string, description: string, evidenceLinks: string) {
    const nft = await this.landNftRepository.findOne({ where: { tokenId } });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    const report = this.fraudReportRepository.create({
      tokenId,
      reporterId,
      reason: description,
      evidenceImages: evidenceLinks,
      status: 'Pending',
    });

    return this.fraudReportRepository.save(report);
  }

  async resolveReport(reportId: number, reviewerId: number, resolutionStatus: string, notes: string, lockNft: boolean) {
    const report = await this.fraudReportRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Fraud report not found');
    }

    if (report.status !== 'Pending') {
      throw new BadRequestException('Report is already resolved');
    }

    report.status = resolutionStatus;
    report.reviewedBy = reviewerId;
    report.resolutionNotes = notes;
    report.resolvedAt = new Date();

    await this.fraudReportRepository.save(report);

    if (lockNft) {
      const nft = await this.landNftRepository.findOne({ where: { tokenId: report.tokenId } });
      if (nft) {
        nft.status = 'Locked';
        await this.landNftRepository.save(nft);
      }
    } else if (resolutionStatus === 'Dismissed' && !lockNft) {
      // If there was a temporary lock, we might want to unlock it. 
      // For now, only lock if explicitly requested.
      const nft = await this.landNftRepository.findOne({ where: { tokenId: report.tokenId } });
      if (nft && nft.status === 'Locked') {
        // Unlock if all reports are dismissed (simplified)
        nft.status = 'Normal';
        await this.landNftRepository.save(nft);
      }
    }

    return report;
  }
}
