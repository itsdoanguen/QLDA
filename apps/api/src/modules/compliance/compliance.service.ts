import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../database/entities/dispute.entity';
import { Mortgage } from '../database/entities/mortgage.entity';
import { PlanningZone } from '../database/entities/planning-zone.entity';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(Mortgage)
    private readonly mortgageRepository: Repository<Mortgage>,
    @InjectRepository(PlanningZone)
    private readonly planningZoneRepository: Repository<PlanningZone>,
  ) {}

  async getDisputes(tokenId: string) {
    return this.disputeRepository.find({ where: { tokenId } });
  }

  async getMortgages(tokenId: string) {
    return this.mortgageRepository.find({ where: { tokenId } });
  }

  async getPlanningZones() {
    return this.planningZoneRepository.find();
  }

  async preCheck(tokenId: string): Promise<{ isSafe: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // 1. Check for Active Disputes
    const disputes = await this.disputeRepository.find({ where: { tokenId, status: 'Active' } });
    if (disputes.length > 0) {
      reasons.push('Tài sản đang trong tình trạng tranh chấp (Active Dispute).');
    }

    // 2. Check for Active Mortgages
    const mortgages = await this.mortgageRepository.find({ where: { tokenId, status: 'Active' } });
    if (mortgages.length > 0) {
      reasons.push('Tài sản đang được thế chấp (Active Mortgage).');
    }

    // Note: Checking planning zones would ideally involve GIS/spatial query.
    // For this phase, if there's no active dispute or mortgage, we consider it safe enough to draft.

    return {
      isSafe: reasons.length === 0,
      reasons,
    };
  }
}
