import { Module } from '@nestjs/common';

import { VneidController } from './vneid.controller';
import { VneidService } from './vneid.service';

@Module({
  controllers: [VneidController],
  providers: [VneidService],
  exports: [VneidService],
})
export class VneidModule {}
