import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { IpfsModule } from '../ipfs/ipfs.module';
import { RedisModule } from '../redis/redis.module';
import { LandFile } from '../database/entities/land-file.entity';
import { User } from '../database/entities/user.entity';
import { LandRecord } from '../database/entities/land-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LandFile, User, LandRecord]),

    IpfsModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
