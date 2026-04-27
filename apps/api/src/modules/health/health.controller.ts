import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse } from '@land-registry/shared-types';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get basic API health status' })
  getHealth(): ApiResponse<{ status: string; timestamp: string }> {
    return {
      success: true,
      data: this.healthService.getHealth(),
    };
  }

  @Get('dependencies')
  @ApiOperation({ summary: 'Get health status of all system dependencies' })
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
