import type { LandRecord, LandRecordListResponse } from '@/types/land-record';

export const MOCK_LAND_RECORDS: LandRecord[] = [
  {
    id: 'lr_001',
    documentCode: 'GCN-2024-001',
    documentType: 'Giấy chứng nhận QSDĐ',
    submittedAt: '2024-03-15T10:30:00Z',
    blockchainStatus: 'on_chain',
    ownerName: 'Nguyễn Văn A',
    area: 120.5,
    location: '123 Nguyễn Huệ, Q.1, TP.HCM',
    nftTokenId: '0x1234...abcd',
  },
  {
    id: 'lr_002',
    documentCode: 'GCN-2024-002',
    documentType: 'Hợp đồng chuyển nhượng',
    submittedAt: '2024-04-01T14:00:00Z',
    blockchainStatus: 'pending',
    ownerName: 'Trần Thị B',
    area: 85.0,
    location: '456 Lê Lợi, Q.3, TP.HCM',
  },
  {
    id: 'lr_003',
    documentCode: 'GCN-2024-003',
    documentType: 'Giấy chứng nhận QSDĐ',
    submittedAt: '2024-04-10T09:15:00Z',
    blockchainStatus: 'verified',
    ownerName: 'Lê Văn C',
    area: 200.0,
    location: '789 Trần Phú, Q.5, TP.HCM',
  },
];

export const MOCK_LAND_RECORD_LIST: LandRecordListResponse = {
  data: MOCK_LAND_RECORDS,
  total: 3,
  page: 1,
  pageSize: 10,
};
