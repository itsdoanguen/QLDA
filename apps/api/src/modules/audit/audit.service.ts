import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from '../database/entities/system-log.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ethers } from 'ethers';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly buffer: string[] = [];
  private readonly flushThreshold = 10;
  private readonly flushIntervalMs = 60000; // 60s

  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
    private readonly blockchainService: BlockchainService,
  ) {}

  // Start periodic flush
  onModuleInit() {
    setInterval(() => this.flushBuffer().catch(err => this.logger.error('Batch flush failed', err)), this.flushIntervalMs);
  }

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
      // Attempt immediate single record (best-effort)
      await this.blockchainService.recordLogHash(hashValue);
    } catch (error) {
      this.logger.error(`Failed to record audit log on chain (single): ${(error as Error).message}`);
    }

    // Buffer for batch recording to save gas
    this.buffer.push(hashValue);
    if (this.buffer.length >= this.flushThreshold) {
      // fire-and-forget
      this.flushBuffer().catch(err => this.logger.error('Batch flush failed', err));
    }

    return savedLog;
  }

  private async flushBuffer() {
    if (this.buffer.length === 0) return;
    const toFlush = this.buffer.splice(0, this.buffer.length);
    try {
      await this.blockchainService.batchRecordLogHashes(toFlush);
      this.logger.log(`Flushed ${toFlush.length} audit log hashes on-chain`);
    } catch (error) {
      this.logger.error('Failed to batch record audit log hashes, reinserting to buffer', error as any);
      // Re-insert failed batch at front
      this.buffer.unshift(...toFlush);
    }
  }
}
