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

  async findApprovedApprovals(): Promise<any[]> {
    const records = await this.landRecordRepository.find({
      where: [
        { status: LandRecordStatus.LEADER_SIGNED },
        { status: LandRecordStatus.MINTED }
      ],
      relations: ['owner', 'files'],
      order: { updatedAt: 'DESC' },
    });

    const results = [];
    for (const record of records) {
      const nft = await this.landRecordRepository.manager.getRepository('LandNFT').findOne({
        where: { recordId: record.id }
      });
      results.push({
        ...record,
        tokenId: nft ? nft.tokenId : null
      });
    }
    return results;
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
    let signTxHash: string;
    try {
      const txId = await this.blockchainService.getOrCreateMultiSigTx(recordId.toString());
      signTxHash = await this.blockchainService.signMultiSig(txId, true, reason || 'Lãnh đạo phê duyệt');
    } catch (error) {
      throw new BadRequestException('Lỗi khi ký Multi-sig trên blockchain: ' + (error as Error).message);
    }

    // Save chain tx hash on signature record
    signature.signTxHash = signTxHash;
    await this.signatureRepository.save(signature);

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
    let rejectTxHash: string;
    try {
      const txId = await this.blockchainService.getOrCreateMultiSigTx(recordId.toString());
      rejectTxHash = await this.blockchainService.signMultiSig(txId, false, reason);
    } catch (error) {
      throw new BadRequestException('Lỗi khi từ chối Multi-sig trên blockchain: ' + (error as Error).message);
    }

    // Save chain tx hash on signature record
    signature.signTxHash = rejectTxHash;
    await this.signatureRepository.save(signature);

    // 3. Update record status - return to Needs Supplement so Cán bộ or Citizen can fix
    record.status = LandRecordStatus.NEEDS_SUPPLEMENT;
    record.reviewReason = `Lãnh đạo Reject: ${reason}`;
    return this.landRecordRepository.save(record);
  }

  async batchSign(
    batchData: { recordId: number; isApproved: boolean; reason?: string }[],
    userId: number,
  ) {
    const results: { recordId: number; success: boolean; decision?: string; error?: string }[] = [];
    const txIds: number[] = [];
    const isApprovedArr: boolean[] = [];
    const reasonsArr: string[] = [];
    const signatureRecords: Signature[] = [];

    // Phase 1: Validate and prepare all records, create DB entries
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

        const reasonText = item.reason || (item.isApproved ? 'Lãnh đạo phê duyệt hàng loạt' : '');

        const signature = this.signatureRepository.create({
          requestId: request.id,
          userId,
          decision: requestStatus,
          reason: reasonText,
          signedAt: new Date(),
        });
        await this.signatureRepository.save(signature);
        signatureRecords.push(signature);

        // Prepare on-chain multi-sig tx
        const txId = await this.blockchainService.getOrCreateMultiSigTx(item.recordId.toString());
        txIds.push(txId);
        isApprovedArr.push(item.isApproved);
        reasonsArr.push(reasonText);

        // Update record status in DB
        if (item.isApproved) {
          record.status = LandRecordStatus.LEADER_SIGNED;
        } else {
          record.status = LandRecordStatus.NEEDS_SUPPLEMENT;
          record.reviewReason = `Lãnh đạo Reject: ${item.reason}`;
          record.isFrozen = false;
        }
        await this.landRecordRepository.save(record);
        
        results.push({ recordId: item.recordId, success: true, decision: requestStatus });
      } catch (error) {
        results.push({ recordId: item.recordId, success: false, error: (error as Error).message });
      }
    }

    // Phase 2: Execute batch signing on-chain in a single transaction
    let batchTxHash: string | undefined;
    if (txIds.length > 0) {
      try {
        batchTxHash = await this.blockchainService.batchSignMultiSig(txIds, isApprovedArr, reasonsArr);

        // Save the batch tx hash on all signature records
        for (const sig of signatureRecords) {
          sig.signTxHash = batchTxHash;
          await this.signatureRepository.save(sig);
        }
      } catch (error) {
        // On-chain batch signing failed — DB is already updated.
        // In production, consider rolling back DB changes or flagging for retry.
        throw new BadRequestException(
          'Lỗi khi ký hàng loạt trên blockchain: ' + (error as Error).message
          + '. Lưu ý: DB đã được cập nhật, cần đối soát thủ công.',
        );
      }
    }

    const totalSuccess = results.filter(r => r.success).length;
    return {
      results,
      batchTxHash,
      totalProcessed: results.length,
      totalSuccess,
      totalFailed: results.length - totalSuccess,
    };
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
