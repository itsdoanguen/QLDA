import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NftVerifyBlockchainDetailsDto {
  @ApiProperty({ example: '1' })
  tokenId: string;

  @ApiProperty({ example: '0x321654...' })
  ownerOf: string;

  @ApiProperty({ example: 'ipfs://Qm123...' })
  tokenURI: string;

  @ApiProperty({ example: true })
  isValid: boolean;
}

export class NftVerifyDatabaseDetailsDto {
  @ApiProperty({ example: '1' })
  tokenId: string;

  @ApiProperty({ example: '0x321654...' })
  ownerWallet: string;

  @ApiProperty({ example: 'ipfs://Qm123...' })
  metadataUri: string;

  @ApiProperty({ example: 'Normal' })
  status: string;

  @ApiProperty({ example: 101 })
  recordId: number;
}

export class NftVerifyComparisonDto {
  @ApiProperty({ example: true })
  ownerMatches: boolean;

  @ApiProperty({ example: true })
  metadataMatches: boolean;

  @ApiProperty({ example: true })
  isAuthentic: boolean;
}

export class NftVerifyLandDetailsDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  ownerName: string;

  @ApiProperty({ example: '123 Đường Trần Hưng Đạo, Quận 1, TP. HCM' })
  location: string;

  @ApiProperty({ example: 150.5 })
  area: number;

  @ApiProperty({ example: 'Đất ở đô thị' })
  landType: string;

  @ApiProperty({ example: '12' })
  plotNumber: string;

  @ApiProperty({ example: '45' })
  parcelNumber: string;
}

export class NftVerifyResponseDto {
  @ApiProperty({ description: 'QR Code raw input data', example: 'https://landregistry.gov.vn/verify/1' })
  qrData: string;

  @ApiProperty({ description: 'Parsed Token ID', example: '1' })
  tokenId: string;

  @ApiProperty({ description: 'Trạng thái xác thực tổng quan', example: true })
  isVerified: boolean;

  @ApiProperty({ description: 'Thông điệp kết quả xác thực', example: 'Xác thực thành công. Dữ liệu trên blockchain trùng khớp hoàn toàn với hệ thống.' })
  message: string;

  @ApiProperty({ type: NftVerifyBlockchainDetailsDto, nullable: true })
  blockchain: NftVerifyBlockchainDetailsDto | null;

  @ApiProperty({ type: NftVerifyDatabaseDetailsDto, nullable: true })
  database: NftVerifyDatabaseDetailsDto | null;

  @ApiProperty({ type: NftVerifyComparisonDto })
  comparison: NftVerifyComparisonDto;

  @ApiProperty({ type: NftVerifyLandDetailsDto, nullable: true })
  landDetails: NftVerifyLandDetailsDto | null;
}
