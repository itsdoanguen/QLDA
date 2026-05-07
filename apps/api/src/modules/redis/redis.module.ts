import { Module, Global } from '@nestjs/common';

import { RedisSessionService } from './redis-session.service';

@Global()
@Module({
  providers: [RedisSessionService],
  exports: [RedisSessionService],
})
export class RedisModule {}
