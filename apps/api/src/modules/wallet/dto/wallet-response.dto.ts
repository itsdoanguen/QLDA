import { ApiProperty } from '@nestjs/swagger';

export class WalletDetailsResponseDto {
  @ApiProperty({ example: '0x8ba1f109551bD432803012645Ac136ddd64DBA72' })
  walletAddress: string;

  @ApiProperty({ example: '0.15' })
  balanceETH: string;

  @ApiProperty({ example: '150000000000000000' })
  balanceWEI: string;

  @ApiProperty({ example: 42 })
  txCount: number;

  @ApiProperty({ example: false })
  isContract: boolean;
}

export class WalletRecoveryItemDto {
  @ApiProperty({ example: 101 })
  requestId: number;

  @ApiProperty({ example: 'Pending' })
  status: string;

  @ApiProperty({ example: '2026-04-28T10:20:00.000Z' })
  createdAt: Date;
}

export class WalletStatusResponseDto {
  @ApiProperty({ type: WalletDetailsResponseDto, nullable: true })
  activeWallet: WalletDetailsResponseDto | null;

  @ApiProperty({ type: [WalletRecoveryItemDto] })
  recoveryRequests: WalletRecoveryItemDto[];
}
