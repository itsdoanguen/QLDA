import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { User } from '../database/entities/user.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';
import { CreateLandRecordDto } from './dto/create-land-record.dto';
import { UpdateLandRecordDto } from './dto/update-land-record.dto';

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
      relations: ['owner', 'assignedCb'],
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
}
