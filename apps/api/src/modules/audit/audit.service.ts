import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from '../database/entities/system-log.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ethers } from 'ethers';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createLog(data: {
    userId?: number;
    action: string;
    targetTable: string;
    targetId: string;
    ipAddress?: string;
    hashValue?: string;
  }) {
    let hashValue = data.hashValue;
    if (!hashValue || hashValue === 'no_hash') {
      const payload = `${data.userId || 0}-${data.action}-${data.targetTable}-${data.targetId}-${Date.now()}`;
      hashValue = ethers.sha256(ethers.toUtf8Bytes(payload));
    }

    const log = this.systemLogRepository.create({
      ...data,
      hashValue,
    });
    const savedLog = await this.systemLogRepository.save(log);

    // Task A8: Tích hợp AuditLog on-chain
    try {
      await this.blockchainService.recordLogHash(hashValue);
    } catch (error) {
      this.logger.error(`Failed to record audit log on chain: ${(error as Error).message}`);
    }

    return savedLog;
  }
}
