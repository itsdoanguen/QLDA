import { ApiProperty } from '@nestjs/swagger';

export class NftProvenanceEventDto {
  @ApiProperty({ example: 'LandStatusChanged', description: 'Loại sự kiện (LandCreated, LandStatusChanged, Transfer)' })
  type: string;

  @ApiProperty({ example: 12345, description: 'Số block chứa transaction' })
  blockNumber: number;

  @ApiProperty({ example: '0xabc123...', description: 'Mã băm giao dịch' })
  transactionHash: string;

  @ApiProperty({ example: '2026-05-21T10:00:00.000Z', description: 'Thời gian giao dịch xảy ra' })
  timestamp: string;

  @ApiProperty({ example: 'DA_CAP_SO', required: false, description: 'Trạng thái cũ (đối với LandStatusChanged)' })
  oldStatus?: string;

  @ApiProperty({ example: 'THE_CHAP', required: false, description: 'Trạng thái mới (đối với LandStatusChanged)' })
  newStatus?: string;

  @ApiProperty({ example: '0x000000...', required: false, description: 'Địa chỉ ví gửi (đối với Transfer)' })
  from?: string;

  @ApiProperty({ example: '0xRecipient...', required: false, description: 'Địa chỉ ví nhận (đối với Transfer hoặc LandCreated)' })
  to?: string;

  @ApiProperty({ example: 'ipfs://Qm123...', required: false, description: 'Metadata URI của token (đối với LandCreated)' })
  metadataUri?: string;

  @ApiProperty({ example: 'Đã cấp sổ đỏ -> Đang thế chấp', description: 'Mô tả chi tiết sự kiện bằng tiếng Việt' })
  description: string;
}

export class NftProvenanceResponseDto {
  @ApiProperty({ example: '1', description: 'Token ID của Land NFT' })
  tokenId: string;

  @ApiProperty({ type: [NftProvenanceEventDto], description: 'Danh sách sự kiện lịch sử biến động' })
  events: NftProvenanceEventDto[];
}
