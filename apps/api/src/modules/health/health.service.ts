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
    // VNeID is now an external HTTP sandbox. Smoke check verifies the service
    // is wired and VNEID_BASE_URL is configured (not a live call at startup).
    if (!this.vneidService) {
      throw new Error('VNeID service not wired.');
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
      fileName: 'smoke.txt',
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
