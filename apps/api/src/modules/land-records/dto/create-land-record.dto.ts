import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLandRecordDto {
  @ApiProperty({ example: '123 Nguyen Trai, District 1, HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @IsNotEmpty()
  area: number;

  @ApiProperty({ example: 'Tờ số 10', required: false })
  @IsString()
  @IsOptional()
  plotNumber?: string;

  @ApiProperty({ example: 'Thửa số 25', required: false })
  @IsString()
  @IsOptional()
  parcelNumber?: string;

  @ApiProperty({ example: 'Đất ở đô thị', required: false })
  @IsString()
  @IsOptional()
  landType?: string;

  @ApiProperty({ example: '10.762622, 106.660172', required: false })
  @IsString()
  @IsOptional()
  gpsCoordinates?: string;

  @ApiProperty({ example: [1, 2], required: false })
  @IsOptional()
  fileIds?: number[];
}
