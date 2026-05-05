import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { User } from '../database/entities/user.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { LandRecordService } from './land-record.service';
import { LandRecordController } from './land-record.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandRecord, User, LandFile]),
    AuthModule,
    RedisModule,
  ],
  controllers: [LandRecordController],
  providers: [LandRecordService],
  exports: [LandRecordService],
})
export class LandRecordModule {}
