import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandRecordVersion } from '../database/entities/land-record-version.entity';
import { User } from '../database/entities/user.entity';

// ============================================================
// LandRecordService chưa tồn tại — đây là bước RED trong TDD.
// File này định nghĩa kịch bản kiểm thử cho business rule:
//   "Mỗi công dân chỉ được lưu tối đa 5 bản nháp cùng lúc."
// Khi implement service, import và bổ sung cho phù hợp.
// ============================================================

// Placeholder — sẽ được thay bằng import thật khi tạo service
// import { LandRecordService } from './land-record.service';
class LandRecordService {
  createDraft(_userId: number, _dto: any): Promise<any> {
    throw new Error('Not implemented');
  }
}

/**
 * Hằng số giới hạn — service thực tế nên export constant này
 * để dùng chung giữa code và test.
 */
const MAX_DRAFTS_PER_CITIZEN = 5;

describe('LandRecordService — Giới hạn 5 bản nháp / công dân', () => {
  let service: LandRecordService;
  let landRecordRepository: any;
  let landRecordVersionRepository: any;
  let userRepository: any;

  // ----- helpers -----
  const mockUser = (id = 1) => ({
    id,
    vneidNumber: '012345678912',
    fullName: 'Nguyen Van A',
    status: 'Active',
  });

  const mockDraft = (id: number, ownerId: number) => ({
    id,
    ownerId,
    address: `123 Đường ${id}`,
    area: 100,
    status: 'Draft',
    isFrozen: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const validDto = {
    address: '456 Đường Mới',
    area: 200,
    gpsCoordinates: '10.762622,106.660172',
  };

  // ----- setup -----
  beforeEach(async () => {
    landRecordRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    landRecordVersionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandRecordService,
        { provide: getRepositoryToken(LandRecord), useValue: landRecordRepository },
        { provide: getRepositoryToken(LandRecordVersion), useValue: landRecordVersionRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<LandRecordService>(LandRecordService);
  });

  // =====================================================
  // 1. HAPPY PATH — Tạo nháp khi chưa đạt giới hạn
  // =====================================================
  describe('Tạo nháp thành công khi chưa đạt giới hạn', () => {
    it('TC-DRAFT-01: Cho phép tạo bản nháp đầu tiên (0 nháp hiện có)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(0);
      landRecordRepository.create.mockReturnValue(mockDraft(1, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(1, 1));

      const result = await service.createDraft(1, validDto);

      expect(landRecordRepository.count).toHaveBeenCalledWith({
        where: { ownerId: 1, status: 'Draft' },
      });
      expect(landRecordRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('Draft');
    });

    it('TC-DRAFT-02: Cho phép tạo bản nháp thứ 5 (4 nháp hiện có — biên dưới)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(4);
      landRecordRepository.create.mockReturnValue(mockDraft(5, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(5, 1));

      const result = await service.createDraft(1, validDto);

      expect(landRecordRepository.count).toHaveBeenCalledWith({
        where: { ownerId: 1, status: 'Draft' },
      });
      expect(landRecordRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('Draft');
    });

    it('TC-DRAFT-03: Cho phép tạo nháp khi có 3 nháp (vùng an toàn)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(3);
      landRecordRepository.create.mockReturnValue(mockDraft(4, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(4, 1));

      const result = await service.createDraft(1, validDto);

      expect(result.status).toBe('Draft');
    });
  });

  // =====================================================
  // 2. BOUNDARY — Từ chối khi đạt đúng 5 bản nháp
  // =====================================================
  describe('Từ chối tạo nháp khi đã đạt giới hạn', () => {
    it('TC-DRAFT-04: Từ chối tạo bản nháp thứ 6 khi đã có 5 nháp', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(MAX_DRAFTS_PER_CITIZEN);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('TC-DRAFT-05: Thông báo lỗi phải chứa nội dung giới hạn rõ ràng', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(MAX_DRAFTS_PER_CITIZEN);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(/tối đa.*5.*nháp|maximum.*5.*draft/i);
    });

    it('TC-DRAFT-06: Từ chối khi đã vượt 5 nháp (dữ liệu bất thường, count = 7)', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(7);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  // =====================================================
  // 3. EDGE CASES — Trạng thái hỗn hợp & đa người dùng
  // =====================================================
  describe('Edge cases — trạng thái hỗn hợp', () => {
    it('TC-DRAFT-07: Chỉ đếm status=Draft, không đếm các trạng thái khác', async () => {
      // Người dùng có 5 records nhưng chỉ 2 là Draft, 3 cái còn lại
      // là "Cho_doi_soat", "Da_doi_soat", "Da_Mint"
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(2); // chỉ count Draft

      landRecordRepository.create.mockReturnValue(mockDraft(6, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(6, 1));

      const result = await service.createDraft(1, validDto);

      // Phải gọi count với điều kiện status = 'Draft'
      expect(landRecordRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'Draft' }),
        }),
      );
      expect(result.status).toBe('Draft');
    });

    it('TC-DRAFT-08: Giới hạn áp dụng độc lập cho từng công dân', async () => {
      // User A đã có 5 nháp → bị từ chối
      userRepository.findOne.mockResolvedValue(mockUser(1));
      landRecordRepository.count.mockResolvedValue(5);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);

      // User B chưa có nháp nào → được phép
      userRepository.findOne.mockResolvedValue(mockUser(2));
      landRecordRepository.count.mockResolvedValue(0);
      landRecordRepository.create.mockReturnValue(mockDraft(1, 2));
      landRecordRepository.save.mockResolvedValue(mockDraft(1, 2));

      const result = await service.createDraft(2, validDto);
      expect(result.status).toBe('Draft');
    });

    it('TC-DRAFT-09: Sau khi submit/freeze 1 nháp, có thể tạo nháp mới', async () => {
      // Ban đầu có 5 nháp → bị chặn
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(5);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);

      // Sau khi freeze 1 nháp → chỉ còn 4 Draft → được phép
      landRecordRepository.count.mockResolvedValue(4);
      landRecordRepository.create.mockReturnValue(mockDraft(6, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(6, 1));

      const result = await service.createDraft(1, validDto);
      expect(result.status).toBe('Draft');
    });

    it('TC-DRAFT-10: Sau khi xóa 1 nháp, có thể tạo nháp mới', async () => {
      // Ban đầu có 5 nháp → bị chặn
      userRepository.findOne.mockResolvedValue(mockUser());
      landRecordRepository.count.mockResolvedValue(5);

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);

      // Sau khi xóa 1 nháp → count giảm còn 4 → được phép
      landRecordRepository.count.mockResolvedValue(4);
      landRecordRepository.create.mockReturnValue(mockDraft(7, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(7, 1));

      const result = await service.createDraft(1, validDto);
      expect(result.status).toBe('Draft');
    });
  });

  // =====================================================
  // 4. VALIDATION — Kiểm tra user hợp lệ
  // =====================================================
  describe('Validation — người dùng không hợp lệ', () => {
    it('TC-DRAFT-11: Từ chối nếu userId không tồn tại', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.createDraft(999, validDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('TC-DRAFT-12: Từ chối nếu user có status = Inactive', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser(),
        status: 'Inactive',
      });

      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  // =====================================================
  // 5. CONCURRENT — Race condition (kiểm thử ý tưởng)
  // =====================================================
  describe('Concurrent — kiểm tra race condition', () => {
    it('TC-DRAFT-13: Hai request tạo nháp đồng thời khi đang có 4 nháp → chỉ 1 thành công', async () => {
      // Kịch bản: user đang có 4 nháp, gửi 2 request createDraft cùng lúc.
      // Cả hai đều đọc count = 4 (< 5) nên cả hai đều pass guard.
      // Nếu không có lock/transaction isolation, sẽ có 6 nháp.
      //
      // Test này mô phỏng ý tưởng — implementation thực tế cần:
      //   - Pessimistic lock (SELECT ... FOR UPDATE) hoặc
      //   - Unique partial index trên DB level
      //
      // Ở đây chúng ta chỉ assert rằng service PHẢI kiểm tra lại
      // count sau khi acquire lock trước khi save.

      userRepository.findOne.mockResolvedValue(mockUser());

      // Lần count đầu: 4 (pass guard)
      // Lần count thứ 2 (sau lock): 5 (đã có request khác insert)
      landRecordRepository.count
        .mockResolvedValueOnce(4)  // request 1: pre-check
        .mockResolvedValueOnce(5); // request 2: re-check after lock → reject

      landRecordRepository.create.mockReturnValue(mockDraft(5, 1));
      landRecordRepository.save.mockResolvedValue(mockDraft(5, 1));

      // Request 1: thành công
      const result = await service.createDraft(1, validDto);
      expect(result.status).toBe('Draft');

      // Request 2: count = 5 → bị từ chối
      await expect(service.createDraft(1, validDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  // =====================================================
  // 6. SUMMARY TABLE — Ma trận kiểm thử (cho tài liệu)
  // =====================================================
  // ┌─────────────┬──────────────────────────────────────────────────┬───────────────┐
  // │ Test Case   │ Mô tả                                           │ Kết quả       │
  // ├─────────────┼──────────────────────────────────────────────────┼───────────────┤
  // │ TC-DRAFT-01 │ Tạo nháp đầu tiên (0 nháp)                      │ ✅ Thành công │
  // │ TC-DRAFT-02 │ Tạo nháp thứ 5 (4 nháp hiện có)                 │ ✅ Thành công │
  // │ TC-DRAFT-03 │ Tạo nháp khi có 3 nháp                          │ ✅ Thành công │
  // │ TC-DRAFT-04 │ Tạo nháp thứ 6 (5 nháp hiện có)                 │ ❌ BadRequest │
  // │ TC-DRAFT-05 │ Thông báo lỗi chứa nội dung giới hạn            │ ❌ Regex match │
  // │ TC-DRAFT-06 │ Count bất thường (7 nháp)                        │ ❌ BadRequest │
  // │ TC-DRAFT-07 │ Chỉ đếm Draft, bỏ qua trạng thái khác           │ ✅ Thành công │
  // │ TC-DRAFT-08 │ Giới hạn độc lập giữa các công dân               │ ✅/❌ Tùy user│
  // │ TC-DRAFT-09 │ Tạo nháp sau khi freeze/submit 1 bản             │ ✅ Thành công │
  // │ TC-DRAFT-10 │ Tạo nháp sau khi xóa 1 bản                      │ ✅ Thành công │
  // │ TC-DRAFT-11 │ User không tồn tại                               │ ❌ NotFound   │
  // │ TC-DRAFT-12 │ User bị Inactive                                 │ ❌ BadRequest │
  // │ TC-DRAFT-13 │ Race condition — 2 request đồng thời             │ ❌ 1 bị reject│
  // └─────────────┴──────────────────────────────────────────────────┴───────────────┘
});
