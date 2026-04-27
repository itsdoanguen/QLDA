## VNeID Sandbox Plan (Phase 1 Dependency)

### Muc tieu
Tao mot VNeID sandbox/noi bo de Backend co the code va test Phase 1 ma khong phu thuoc vao DB that hay he thong ben ngoai.

### Pham vi
Sandbox phai mo phong duoc:
- Kiem tra danh tinh CCCD.
- Tra ve profile cong dan deterministic.
- Kiem tra CCCD da duoc lien ket hay chua.
- Dang ky CCCD vao sandbox de phuc vu duplicate flow.
- Rate limit va audit log cho cac lan lookup/verify.

Khong bao gom:
- Sinh JWT.
- Liveness/biometric.
- Multi-sig.
- Fraud scoring.
- Blockchain signature verification.

---

## 1. Giai phap de xuat

### 1.1 Kien truc
- Tao 1 service sandbox rieng trong backend monorepo hoac 1 module mock trong `apps/api` neu team muon don gian hoa giai doan dau.
- BE auth chi goi qua interface `VNeIDGateway`, khong goi truc tiep vao storage.
- Sandbox phai co fixture seed co dinh de test lap lai duoc.

### 1.2 Lua chon don gian nhat
- Giai doan 1: JSON fixtures + in-memory store.
- Giai doan 2: SQLite hoac Postgres local cho OTP/rate limit/audit.
- Giai doan 3: fault injection co dieu khien (timeout, 500, locked, expired).

### 1.3 Nguyen tac
- Contract response phai versioned.
- Moi CCCD chi co 1 trang thai dang hoat dong tai 1 thoi diem.
- Sandbox phai deterministic cho test automation.

---

## 2. Endpoint list

### 2.1 Mock service endpoints
- `POST /mock-vneid/v1/verify-identity`
- `POST /mock-vneid/v1/check-duplicate`
- `GET /mock-vneid/v1/profile/:cccd`
- `POST /mock-vneid/v1/register-cccd`
- `GET /mock-vneid/v1/health`

### 2.2 BE integration points
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/verify-otp` (auto provision managed wallet)
- `POST /api/v1/wallet/recovery-request`

---

## 3. Data model cho sandbox

### 3.1 Bang can co

#### Vneid_Citizens
- `id`
- `cccd_number` unique
- `full_name`
- `email`
- `phone`
- `date_of_birth`
- `issued_date`
- `expiry_date`
- `status` (`VALID`, `EXPIRED`, `REVOKED`, `SUSPENDED`, `NOT_FOUND`)
- `registered_with_user_id` nullable
- `linked_wallet_address` nullable
- `created_at`
- `updated_at`

#### Vneid_Auth_Requests
- `id`
- `cccd_number`
- `operation` (`VERIFY`, `CHECK_DUPLICATE`, `PROFILE`, `REGISTER`)
- `request_id`
- `result` (`SUCCESS`, `FAILURE`)
- `error_code` nullable
- `error_message` nullable
- `ip_address`
- `created_at`

#### Vneid_Otp_Sessions
- `id`
- `cccd_number`
- `otp_code`
- `expires_at`
- `attempt_count`
- `max_attempt`
- `verified_at` nullable
- `status` (`ACTIVE`, `VERIFIED`, `EXPIRED`, `LOCKED`)
- `created_at`

#### Vneid_Audit_Logs
- `id`
- `cccd_number`
- `action`
- `outcome`
- `request_ip`
- `response_status`
- `trace_id`
- `created_at`

### 3.2 Seed data
- Can co 5-10 CCCD co dinh cho test fixture.
- It nhat 1 CCCD cho moi scenario:
  - happy path
  - not found
  - locked
  - expired
  - duplicate
  - rate limited

---

## 4. Response contract cho sandbox

### 4.1 Success envelope chung
- `success: true`
- `message`
- `data`
- `timestamp`
- `request_id`
- `trace_id`

### 4.2 Error envelope chung
- `success: false`
- `message`
- `error.code`
- `error.details`
- `timestamp`
- `request_id`
- `trace_id`
- `retry_after` optional cho rate limit

### 4.3 Success payload cho profile/verify
- `cccd_number`
- `full_name`
- `email`
- `phone`
- `date_of_birth`
- `issued_date`
- `expiry_date`
- `status`
- `is_duplicate`
- `registered_with_user_id` nullable
- `linked_wallet_address` nullable
- `verified_at`

### 4.4 Error codes bat buoc
- `INVALID_CCCD_FORMAT`
- `CCCD_NOT_FOUND`
- `CCCD_ALREADY_REGISTERED`
- `CCCD_INVALID_STATUS`
- `RATE_LIMIT_EXCEEDED`
- `VNEID_SERVICE_UNAVAILABLE`
- `VNEID_TIMEOUT`

---

## 5. Scenario matrix

### 5.1 Happy path
- CCCD hop le.
- Profile ton tai.
- Chua link wallet.
- Tra ve success.

### 5.2 Not found
- CCCD dung format nhung khong co trong registry.
- Tra `CCCD_NOT_FOUND`.

### 5.3 Locked or revoked
- CCCD ton tai nhung status khong hop le.
- Tra `CCCD_INVALID_STATUS`.

### 5.4 Duplicate
- CCCD da duoc link voi user/wallet khac.
- Tra `CCCD_ALREADY_REGISTERED`.

### 5.5 Rate limit
- Vuot qua so lan lookup trong cua so thoi gian.
- Tra `RATE_LIMIT_EXCEEDED` va `retry_after`.

### 5.6 Timeout / service unavailable
- Mock co che fault injection de test resilience.
- Tra `VNEID_TIMEOUT` hoac `VNEID_SERVICE_UNAVAILABLE`.

---

## 6. Test gate cho sandbox

1. Verify identity tra dung profile fixture.
2. Duplicate check tra dung trang thai linked/unlinked.
3. Not found tra error code dung format.
4. Rate limit lenh 6 trong 60s bi chan.
5. Locked/expired profile bi tu choi.
6. Health check tra status ok.

---

## 7. Implementation plan

### Day 1
- Chot contract va response envelope.
- Chot danh sach error code.

### Day 2
- Tao storage va seed fixtures.
- Tao audit log va request log.

### Day 3
- Implement verify/profile/check-duplicate/register/health.
- Them fault injection flags.

### Day 4
- Tich hop vao `VNeIDGateway` cua BE.
- Viet test cho login flow, duplicate flow, expired flow, rate limit flow.

---

## 8. Definition of Done

Sandbox duoc xem la done khi:
- Contract response on dinh.
- Tat ca scenario matrix pass.
- BE auth consume duoc mock ma khong can chinh code khi chuyen tu fixture sang local DB.
- Test automation chay lap lai duoc va ket qua on dinh.

---

## 9. Lien ket voi Phase 1

- File nay phuc vu truc tiep [be-plan-phase-1-auth-wallet.md](be-plan-phase-1-auth-wallet.md).
- Noi dung nay can duoc doc cung voi [be-taskboard-foundation-phase1.md](be-taskboard-foundation-phase1.md).
- Neu contract thay doi, update dong thoi file response contract catalog.