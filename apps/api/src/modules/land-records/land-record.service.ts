import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { User } from '../database/entities/user.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';
import { CreateLandRecordDto } from './dto/create-land-record.dto';
import { UpdateLandRecordDto } from './dto/update-land-record.dto';
import { ReviewLandRecordDto, UpdateGpsDto } from './dto/review-land-record.dto';

@Injectable()
export class LandRecordService {
  constructor(
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LandFile)
    private readonly landFileRepository: Repository<LandFile>,
  ) { }

  async createDraft(ownerId: number, dto: CreateLandRecordDto): Promise<LandRecord> {
    const { fileIds, ...recordData } = dto;
    const draft = this.landRecordRepository.create({
      ...recordData,
      ownerId,
      status: LandRecordStatus.DRAFT,
    });

    const savedDraft = await this.landRecordRepository.save(draft);

    if (fileIds && fileIds.length > 0) {
      await this.landFileRepository.update(fileIds, { recordId: savedDraft.id });
    }

    return savedDraft;
  }

  async update(id: number, userId: number, dto: UpdateLandRecordDto): Promise<LandRecord> {
    const { fileIds, ...recordData } = dto;
    const record = await this.landRecordRepository.findOne({ where: { id, ownerId: userId } });
    if (!record) {
      throw new NotFoundException('Land record not found');
    }

    if (record.isFrozen) {
      throw new BadRequestException('Cannot update a frozen record');
    }

    Object.assign(record, recordData);
    const updatedRecord = await this.landRecordRepository.save(record);

    if (fileIds && fileIds.length > 0) {
      await this.landFileRepository.update(fileIds, { recordId: updatedRecord.id });
    }

    return updatedRecord;
  }

  async submit(id: number, userId: number): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id, ownerId: userId } });
    if (!record) {
      throw new NotFoundException('Land record not found');
    }

    if (record.status !== LandRecordStatus.DRAFT && record.status !== LandRecordStatus.NEEDS_SUPPLEMENT) {
      throw new BadRequestException('Record is already submitted or processed');
    }

    // Randomly assign to a CAN_BO
    const randomCb = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.roleCode = :roleCode', { roleCode: 'CAN_BO' })
      .andWhere('user.status = :status', { status: 'Active' })
      .orderBy('RANDOM()')
      .getOne();

    if (!randomCb) {
      throw new BadRequestException('No available staff to assign');
    }

    record.status = LandRecordStatus.SUBMITTED;
    record.assignedCbId = randomCb.id;

    return this.landRecordRepository.save(record);
  }

  async findOne(id: number): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({
      where: { id },
      relations: ['owner', 'assignedCb', 'files'],
    });
    if (!record) {
      throw new NotFoundException('Land record not found');
    }
    return record;
  }

  async findAll(ownerId?: number): Promise<LandRecord[]> {
    const where = ownerId ? { ownerId } : {};
    return this.landRecordRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findAssignedRecords(staffId: number): Promise<LandRecord[]> {
    return this.landRecordRepository.find({
      where: { assignedCbId: staffId },
      relations: ['owner', 'files'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getStaffStats(staffId: number) {
    const records = await this.landRecordRepository.find({
      where: { assignedCbId: staffId },
    });

    return {
      total: records.length,
      submitted: records.filter(r => r.status === 'Submitted').length,
      approved: records.filter(r => r.status === 'CB_APPROVED').length,
      rejected: records.filter(r => r.status === 'Rejected').length,
      needsSupplement: records.filter(r => r.status === 'Needs Supplement').length,
    };
  }

  async review(id: number, staffId: number, dto: ReviewLandRecordDto): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id, assignedCbId: staffId } });
    if (!record) {
      throw new NotFoundException('Land record not assigned to you or not found');
    }

    if (record.status !== LandRecordStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted records can be reviewed');
    }

    record.status = LandRecordStatus.CB_APPROVED;
    record.reviewReason = dto.reason;
    record.isFrozen = true;

    return this.landRecordRepository.save(record);
  }

  async reject(id: number, staffId: number, dto: ReviewLandRecordDto): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id, assignedCbId: staffId } });
    if (!record) {
      throw new NotFoundException('Land record not assigned to you or not found');
    }

    if (!dto.reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    record.status = LandRecordStatus.REJECTED;
    record.reviewReason = dto.reason;

    return this.landRecordRepository.save(record);
  }

  async requestSupplement(id: number, staffId: number, dto: ReviewLandRecordDto): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id, assignedCbId: staffId } });
    if (!record) {
      throw new NotFoundException('Land record not assigned to you or not found');
    }

    if (!dto.reason) {
      throw new BadRequestException('Reason is required for supplement request');
    }

    record.status = LandRecordStatus.NEEDS_SUPPLEMENT;
    record.reviewReason = dto.reason;

    return this.landRecordRepository.save(record);
  }

  async updateGps(id: number, staffId: number, dto: UpdateGpsDto): Promise<LandRecord> {
    const record = await this.landRecordRepository.findOne({ where: { id, assignedCbId: staffId } });
    if (!record) {
      throw new NotFoundException('Land record not assigned to you or not found');
    }

    record.gpsCoordinates = dto.gpsCoordinates;
    return this.landRecordRepository.save(record);
  }
}
