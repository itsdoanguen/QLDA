import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { ApprovalRequest } from '../database/entities/approval-request.entity';
import { Signature } from '../database/entities/signature.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
    @InjectRepository(ApprovalRequest)
    private readonly approvalRequestRepository: Repository<ApprovalRequest>,
    @InjectRepository(Signature)
    private readonly signatureRepository: Repository<Signature>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async findPendingApprovals(): Promise<LandRecord[]> {
    return this.landRecordRepository.find({
      where: { status: LandRecordStatus.CB_APPROVED },
      relations: ['owner', 'files'],
      order: { updatedAt: 'DESC' },
    });
  }

  async sign(recordId: number, userId: number, reason?: string): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id: recordId } });
    if (!record) {
      throw new NotFoundException('Land record not found');
    }

    if (record.status !== LandRecordStatus.CB_APPROVED) {
      throw new BadRequestException('Record is not in a state that can be signed by Lãnh đạo');
    }

    // 1. Create Approval Request if not exists (or update)
    let request = await this.approvalRequestRepository.findOne({ 
      where: { recordId, requestType: 'Mint_NFT', status: 'Pending' } 
    });
    
    if (!request) {
      request = this.approvalRequestRepository.create({
        recordId,
        requestType: 'Mint_NFT',
        status: 'Approved',
      });
      await this.approvalRequestRepository.save(request);
    } else {
      request.status = 'Approved';
      await this.approvalRequestRepository.save(request);
    }

    // 2. Create Signature entry
    const signature = this.signatureRepository.create({
      requestId: request.id,
      userId,
      decision: 'Approved',
      reason,
      signedAt: new Date(),
    });
    await this.signatureRepository.save(signature);

    // Task A4: Tích hợp Multi-sig on-chain
    try {
      const txId = await this.blockchainService.getOrCreateMultiSigTx(recordId.toString());
      await this.blockchainService.signMultiSig(txId, true, reason || 'Lãnh đạo phê duyệt');
    } catch (error) {
      // In production, we should rollback or throw error. We'll throw to abort the transaction.
      throw new BadRequestException('Lỗi khi ký Multi-sig trên blockchain: ' + (error as Error).message);
    }

    // 3. Update record status
    record.status = LandRecordStatus.LEADER_SIGNED;
    return this.landRecordRepository.save(record);
  }

  async reject(recordId: number, userId: number, reason: string): Promise<LandRecord> {
    if (!reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    const record = await this.landRecordRepository.findOne({ where: { id: recordId } });
    if (!record) {
      throw new NotFoundException('Land record not found');
    }

    if (record.status !== LandRecordStatus.CB_APPROVED) {
      throw new BadRequestException('Record is not in a state that can be rejected by Lãnh đạo');
    }

    // 1. Create/Update Approval Request
    let request = await this.approvalRequestRepository.findOne({ 
      where: { recordId, requestType: 'Mint_NFT', status: 'Pending' } 
    });
    
    if (!request) {
      request = this.approvalRequestRepository.create({
        recordId,
        requestType: 'Mint_NFT',
        status: 'Rejected',
      });
      await this.approvalRequestRepository.save(request);
    } else {
      request.status = 'Rejected';
      await this.approvalRequestRepository.save(request);
    }

    // 2. Create Signature entry
    const signature = this.signatureRepository.create({
      requestId: request.id,
      userId,
      decision: 'Rejected',
      reason,
      signedAt: new Date(),
    });
    await this.signatureRepository.save(signature);

    // Task A4: Tích hợp Multi-sig on-chain
    try {
      const txId = await this.blockchainService.getOrCreateMultiSigTx(recordId.toString());
      await this.blockchainService.signMultiSig(txId, false, reason);
    } catch (error) {
      throw new BadRequestException('Lỗi khi từ chối Multi-sig trên blockchain: ' + (error as Error).message);
    }

    // 3. Update record status - return to Needs Supplement so Cán bộ or Citizen can fix
    record.status = LandRecordStatus.NEEDS_SUPPLEMENT;
    record.reviewReason = `Lãnh đạo Reject: ${reason}`;
    return this.landRecordRepository.save(record);
  }

  async batchSign(
    batchData: { recordId: number; isApproved: boolean; reason?: string }[],
    userId: number,
  ): Promise<any[]> {
    const results = [];
    const txIds: number[] = [];
    const isApprovedArr: boolean[] = [];
    const reasonsArr: string[] = [];

    for (const item of batchData) {
      try {
        if (!item.isApproved && !item.reason) {
          throw new BadRequestException('Reason is required for rejection');
        }

        const record = await this.landRecordRepository.findOne({ where: { id: item.recordId } });
        if (!record) {
          throw new NotFoundException(`Land record ${item.recordId} not found`);
        }
        if (record.status !== LandRecordStatus.CB_APPROVED) {
          throw new BadRequestException(`Record ${item.recordId} is not in a state that can be signed`);
        }

        let request = await this.approvalRequestRepository.findOne({ 
          where: { recordId: item.recordId, requestType: 'Mint_NFT', status: 'Pending' } 
        });
        
        const requestStatus = item.isApproved ? 'Approved' : 'Rejected';
        if (!request) {
          request = this.approvalRequestRepository.create({
            recordId: item.recordId,
            requestType: 'Mint_NFT',
            status: requestStatus,
          });
          await this.approvalRequestRepository.save(request);
        } else {
          request.status = requestStatus;
          await this.approvalRequestRepository.save(request);
        }

        const signature = this.signatureRepository.create({
          requestId: request.id,
          userId,
          decision: requestStatus,
          reason: item.reason || (item.isApproved ? 'Lãnh đạo phê duyệt hàng loạt' : ''),
          signedAt: new Date(),
        });
        await this.signatureRepository.save(signature);

        const txId = await this.blockchainService.getOrCreateMultiSigTx(item.recordId.toString());
        txIds.push(txId);
        isApprovedArr.push(item.isApproved);
        reasonsArr.push(item.reason || (item.isApproved ? 'Lãnh đạo phê duyệt hàng loạt' : ''));

        if (item.isApproved) {
          record.status = LandRecordStatus.LEADER_SIGNED;
        } else {
          record.status = LandRecordStatus.NEEDS_SUPPLEMENT;
          record.reviewReason = `Lãnh đạo Reject: ${item.reason}`;
          record.isFrozen = false;
        }
        await this.landRecordRepository.save(record);
        
        results.push({ recordId: item.recordId, success: true });
      } catch (error) {
        results.push({ recordId: item.recordId, success: false, error: (error as Error).message });
      }
    }

    if (txIds.length > 0) {
      try {
        await this.blockchainService.batchSignMultiSig(txIds, isApprovedArr, reasonsArr);
      } catch (error) {
        throw new BadRequestException('Lỗi khi ký hàng loạt trên blockchain: ' + (error as Error).message);
      }
    }

    return results;
  }

  async getStats() {
    const pendingApproval = await this.landRecordRepository.count({
      where: { status: LandRecordStatus.CB_APPROVED }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const signedToday = await this.landRecordRepository.count({
      where: [
        { status: LandRecordStatus.LEADER_SIGNED, updatedAt: MoreThanOrEqual(startOfToday) },
        { status: LandRecordStatus.MINTED, updatedAt: MoreThanOrEqual(startOfToday) }
      ]
    });

    const returned = await this.landRecordRepository.count({
      where: { status: LandRecordStatus.NEEDS_SUPPLEMENT }
    });

    return {
      pendingApproval: { count: pendingApproval, change: "+0 từ hôm qua" },
      signedToday: { count: signedToday, kpi: "KPI theo ngày" },
      returned: { count: returned, percent: "Tỉ lệ trả về" },
      overdueWarnings: { count: 0, status: "Bình thường" }
    };
  }
}
