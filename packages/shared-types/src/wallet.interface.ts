import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export type WalletStatus = 'Active' | 'Locked' | 'Replaced';
export type WalletRecoveryStatus = 'Pending' | 'Approved' | 'Rejected';

export class WalletLinkRequest {
  @ApiProperty({ example: '0x123...' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class WalletStatusResponse {
  @ApiProperty()
  @IsString()
  walletAddress: string;

  @ApiProperty({ enum: ['Active', 'Locked', 'Replaced'] })
  @IsString()
  status: WalletStatus;

  @ApiProperty()
  @IsString()
  linkedAt: string;
}

export class WalletRecoveryRequestDto {
  @ApiProperty({ example: '0xOld...' })
  @IsString()
  oldWalletAddress: string;

  @ApiProperty({ example: '0xNew...', required: false })
  @IsOptional()
  @IsString()
  newWalletAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class WalletRecoveryResponse {
  @ApiProperty()
  @IsNumber()
  requestId: number;

  @ApiProperty({ enum: ['Pending', 'Approved', 'Rejected'] })
  @IsString()
  status: WalletRecoveryStatus;

  @ApiProperty()
  @IsString()
  createdAt: string;
}
