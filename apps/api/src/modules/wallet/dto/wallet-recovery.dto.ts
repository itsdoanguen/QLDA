import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectRecoveryDto {
  @ApiProperty({ description: 'Reason for rejection', example: 'Thông tin xác minh không khớp' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class RecoveryRequestDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 42 })
  userId: number;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  userFullName?: string;

  @ApiPropertyOptional({ example: '001234567890' })
  userVneidNumber?: string;

  @ApiProperty({ example: '0xOldWalletAddress...' })
  oldWalletAddress: string;

  @ApiProperty({ example: '0xNewWalletAddress...' })
  newWalletAddress: string;

  @ApiProperty({ example: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] })
  status: string;

  @ApiPropertyOptional({ example: 1 })
  chainRequestId?: number;

  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  approverFullName?: string;

  @ApiProperty({ example: '2026-05-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2026-05-20T12:00:00.000Z' })
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'NFTs currently owned by the old wallet', type: [String] })
  affectedTokenIds?: string[];
}
