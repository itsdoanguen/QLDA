import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@land-registry/shared-types';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): ApiResponse<{ status: string; timestamp: string }> {
    return {
      success: true,
      data: this.healthService.getHealth(),
    };
  }

  @Get('dependencies')
  async getDependenciesHealth(): Promise<
    ApiResponse<{
      status: 'ok';
      checks: {
        vneid: string;
        redisSession: string;
        redisBlacklist: string;
        ipfs: string;
      };
    }>
  > {
    return {
      success: true,
      data: await this.healthService.getDependenciesHealth(),
    };
  }
}
