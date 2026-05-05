import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewLandRecordDto {
  @ApiProperty({ example: 'Hồ sơ đầy đủ, hợp lệ.' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateGpsDto {
  @ApiProperty({ example: '10.762622, 106.660172' })
  @IsString()
  @IsNotEmpty()
  gpsCoordinates: string;
}
