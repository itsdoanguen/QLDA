import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class BatchSignItemDto {
  @ApiProperty({ description: 'ID của hồ sơ cần ký', example: 1 })
  @IsInt()
  recordId: number;

  @ApiProperty({ description: 'Phê duyệt (true) hoặc từ chối (false)', example: true })
  @IsBoolean()
  isApproved: boolean;

  @ApiPropertyOptional({ description: 'Lý do (bắt buộc khi từ chối)', example: 'Hồ sơ thiếu giấy tờ' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BatchSignRequestDto {
  @ApiProperty({
    description: 'Danh sách hồ sơ cần ký hàng loạt',
    type: [BatchSignItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchSignItemDto)
  records: BatchSignItemDto[];
}

export class BatchSignResultItemDto {
  @ApiProperty({ example: 1 })
  recordId: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional({ example: 'Approved' })
  decision?: string;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;
}

export class BatchSignResponseDto {
  @ApiProperty({ type: [BatchSignResultItemDto] })
  results: BatchSignResultItemDto[];

  @ApiPropertyOptional({ description: 'Transaction hash from batch on-chain call' })
  batchTxHash?: string;

  @ApiProperty({ description: 'Tổng số hồ sơ được xử lý', example: 5 })
  totalProcessed: number;

  @ApiProperty({ description: 'Số thành công', example: 4 })
  totalSuccess: number;

  @ApiProperty({ description: 'Số thất bại', example: 1 })
  totalFailed: number;
}
