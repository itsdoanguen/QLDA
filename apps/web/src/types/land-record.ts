export type RecordStatus = 'pending' | 'verified' | 'rejected' | 'on_chain';

export interface LandRecord {
  id: string;
  documentCode: string;
  documentType: string;
  submittedAt: string;
  blockchainStatus: RecordStatus;
  ownerName: string;
  area: number;
  location: string;
  nftTokenId?: string;
}

export interface CreateLandRecordRequest {
  documentType: string;
  ownerName: string;
  area: number;
  location: string;
  attachments?: File[];
}

export interface LandRecordListResponse {
  data: LandRecord[];
  total: number;
  page: number;
  pageSize: number;
}
