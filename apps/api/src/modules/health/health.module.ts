import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { VneidModule } from '../vneid/vneid.module';
import { RedisModule } from '../redis/redis.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [VneidModule, RedisModule, IpfsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
