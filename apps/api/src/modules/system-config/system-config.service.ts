import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../database/entities/system-config.entity';
import { SystemConfigAudit } from '../database/entities/system-config-audit.entity';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
    @InjectRepository(SystemConfigAudit)
    private readonly auditRepository: Repository<SystemConfigAudit>,
  ) {}

  async getAll() {
    return this.configRepository.find();
  }

  async getByKey(key: string) {
    const config = await this.configRepository.findOne({ where: { configKey: key } });
    if (!config) {
      throw new NotFoundException(`Config key ${key} not found`);
    }
    return config;
  }

  async updateConfig(key: string, value: string, userId: number) {
    const config = await this.getByKey(key);
    
    // Save audit
    const audit = this.auditRepository.create({
      configKey: key,
      oldValue: config.configValue,
      newValue: value,
      changedByUserId: userId,
    });
    await this.auditRepository.save(audit);

    // Update config
    config.configValue = value;
    return this.configRepository.save(config);
  }

  async getAudits() {
    return this.auditRepository.find({
      relations: ['changedByUser'],
      order: { changedAt: 'DESC' },
    });
  }
}
