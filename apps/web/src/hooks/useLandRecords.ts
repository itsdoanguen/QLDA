import { useState, useEffect, useCallback } from 'react';
import { landRecordService } from '@/services/land-record.service';
import type { LandRecord, CreateLandRecordRequest } from '@/types/land-record';

/**
 * Hook quản lý danh sách hồ sơ đất đai
 * Tự fetch khi mount, expose createRecord để thêm mới
 */
export function useLandRecords() {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await landRecordService.getList(page);
      setRecords(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch land records', err);
      setError('Không thể tải danh sách hồ sơ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = useCallback(async (data: CreateLandRecordRequest) => {
    const newRecord = await landRecordService.create(data);
    setRecords((prev) => [newRecord, ...prev]);
    setTotal((prev) => prev + 1);
    return newRecord;
  }, []);

  return { records, loading, total, error, fetchRecords, createRecord };
}
