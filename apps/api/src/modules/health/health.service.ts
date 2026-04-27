import { Injectable } from '@nestjs/common';
import { IPFS_CLIENT } from '../ipfs/ipfs.constants';
import type { IpfsClient } from '../ipfs/ipfs.types';
import { RedisSessionService } from '../redis/redis-session.service';
import { VneidService } from '../vneid/vneid.service';
import { Inject } from '@nestjs/common';

@Injectable()
export class HealthService {
  constructor(
    private readonly vneidService: VneidService,
    private readonly redisSessionService: RedisSessionService,
    @Inject(IPFS_CLIENT) private readonly ipfsClient: IpfsClient,
  ) {}

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getDependenciesHealth(): Promise<{
    status: 'ok';
    checks: {
      vneid: string;
      redisSession: string;
      redisBlacklist: string;
      ipfs: string;
    };
  }> {
    const verify = this.vneidService.verifyIdentity('012345678901', 'Smoke Test Citizen');
    const duplicate = this.vneidService.checkDuplicate('012345678901');
    const profile = this.vneidService.getProfile('012345678901');

    if (!verify.isValid || duplicate.isDuplicate || profile.cccd !== '012345678901') {
      throw new Error('VNeID smoke check failed.');
    }

    this.redisSessionService.setSession('smoke-session', 'ok', 30);
    const session = this.redisSessionService.getSession('smoke-session');
    if (session !== 'ok') {
      throw new Error('Redis session smoke check failed.');
    }

    this.redisSessionService.blacklistToken('smoke-token', 30);
    const blacklisted = this.redisSessionService.isTokenBlacklisted('smoke-token');
    if (!blacklisted) {
      throw new Error('Redis blacklist smoke check failed.');
    }

    const ipfsResult = await this.ipfsClient.upload({
      content: 'smoke-check-content',
      filename: 'smoke.txt',
    });
    if (!ipfsResult.cid.startsWith('Qm')) {
      throw new Error('IPFS smoke check failed.');
    }

    return {
      status: 'ok',
      checks: {
        vneid: 'ok',
        redisSession: 'ok',
        redisBlacklist: 'ok',
        ipfs: 'ok',
      },
    };
  }
}
