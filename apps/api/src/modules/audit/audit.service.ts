import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from '../database/entities/system-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
  ) {}

  async createLog(data: {
    userId?: number;
    action: string;
    targetTable: string;
    targetId: string;
    ipAddress?: string;
    hashValue?: string;
  }) {
    const log = this.systemLogRepository.create({
      ...data,
      hashValue: data.hashValue || 'no_hash',
    });
    return this.systemLogRepository.save(log);
  }
}
