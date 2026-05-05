import { apiClient } from './api-client';
import type {
  LandRecord,
  LandRecordListResponse,
  CreateLandRecordRequest,
} from '@/types/land-record';
import { MOCK_LAND_RECORD_LIST, MOCK_LAND_RECORDS } from '@/mocks/land-record.mock';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const landRecordService = {
  /**
   * Lấy danh sách hồ sơ đất đai (có phân trang)
   */
  async getList(page = 1, pageSize = 10): Promise<LandRecordListResponse> {
    if (USE_MOCK) return mockDelay(MOCK_LAND_RECORD_LIST);
    const res = await apiClient.get<LandRecordListResponse>('/land-records', {
      params: { page, pageSize },
    });
    return res.data;
  },

  /**
   * Lấy chi tiết 1 hồ sơ theo ID
   */
  async getById(id: string): Promise<LandRecord> {
    if (USE_MOCK) {
      const record = MOCK_LAND_RECORDS.find((r) => r.id === id);
      if (!record) throw new Error('Record not found');
      return mockDelay(record);
    }
    const res = await apiClient.get<LandRecord>(`/land-records/${id}`);
    return res.data;
  },

  /**
   * Tạo mới hồ sơ đất đai
   */
  async create(data: CreateLandRecordRequest): Promise<LandRecord> {
    if (USE_MOCK) {
      const newRecord: LandRecord = {
        id: `lr_${Date.now()}`,
        documentCode: `GCN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        documentType: data.documentType,
        submittedAt: new Date().toISOString(),
        blockchainStatus: 'pending',
        ownerName: data.ownerName,
        area: data.area,
        location: data.location,
      };
      return mockDelay(newRecord, 1200);
    }
    const res = await apiClient.post<LandRecord>('/land-records', data);
    return res.data;
  },
};
