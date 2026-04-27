# Non-Functional Requirements (NFR) & Security Policy v0.1

## 1. Service Level Objectives (SLO) - Tạm thời
- **Auth & Profile API (Local/Staging)**: P95 Latency < 200ms.
- **Uptime**: Nhắm tới 99% uptime trong môi trường test/staging.

## 2. JWT Policy
- **Access Token**: Hết hạn sau `15 phút`.
- **Refresh Token**: Hết hạn sau `7 ngày`.
- Yêu cầu cấu hình secret phức tạp, không sử dụng string đơn giản ở môi trường production.

## 3. Secret Rotation Policy
- **Chu kỳ xoay (Rotation Cycle)**: Các secret (như `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PINATA_JWT`) cần được review và xoay vòng định kỳ mỗi 90 ngày hoặc ngay lập tức nếu nghi ngờ lộ.
- **PINATA_JWT**: Do tương tác với IPFS ngoài (Pinata), cần tuân thủ cấp quyền giới hạn và thu hồi ngay nếu bị lộ.

## 4. Rollback Playbook (Bản 1.0)
Trong trường hợp triển khai (deploy) gặp sự cố nghiêm trọng (ví dụ lỗi kết nối DB, crash loop API):
1. Dừng ngay lập tức quá trình deploy (nếu đang chạy).
2. Kiểm tra log lỗi trên hệ thống CI/CD hoặc container logs.
3. Nếu là lỗi do migration DB (trạng thái data thay đổi), chạy `npm run db:migrate:down` để rollback schema về phiên bản ổn định trước đó.
4. Rollback mã nguồn (revert commit) về bản release ổn định gần nhất và trigger lại pipeline.
5. Cập nhật trạng thái sự cố cho team.

## 5. Monitoring Baseline
Hệ thống giám sát tối thiểu cần ghi nhận:
- **App up/down**: Lắng nghe trạng thái Health Check endpoint (`GET /api/v1/health`).
- **Error Rate**: Tỷ lệ HTTP 5xx errors trong tổng số request.
- **Latency**: Thời gian phản hồi của các request (P50, P90, P95).
- Mọi thao tác nhạy cảm (như thay đổi thông tin xác thực) phải được log lại cẩn thận.
