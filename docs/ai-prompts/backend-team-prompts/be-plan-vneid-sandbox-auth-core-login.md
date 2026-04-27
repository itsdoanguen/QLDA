## BE Plan: VNeID Sandbox + Auth Core Login (Increment)

### Muc tieu
Tach service sandbox VNeID thanh boundary rieng trong folder `vneid-sandbox` va trien khai truoc auth core cho BE blockchain gom `login/logout/profile`.

### Scope da chot
Included:
- Sandbox VNeID service rieng (`vneid-sandbox`).
- Auth core trong API: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/profile`.
- Verify danh tinh thong qua sandbox VNeID.

Excluded (deferred):
- OTP flow.
- Managed wallet provisioning/recovery flow.
- Blockchain boundary mo rong cho auth increment nay.
- Full CI hard-gate phase 0.

---

## 1) Contract tich hop toi thieu API <-> Sandbox

### 1.1 Endpoint
- `POST /mock-vneid/v1/verify-identity`
- `GET /mock-vneid/v1/health`

### 1.2 Verify identity request
```json
{
  "nationalId": "012345678901",
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1990-01-01",
  "requestId": "req-optional"
}
```

### 1.3 Verify identity success
```json
{
  "verified": true,
  "matchScore": 98,
  "person": {
    "nationalId": "012345678901",
    "fullName": "Nguyen Van A",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "placeOfOrigin": "Nam Dinh",
    "placeOfResidence": "Ho Chi Minh City",
    "issueDate": "2019-06-01",
    "expiryDate": "2034-06-01",
    "status": "ACTIVE"
  },
  "providerCode": "OK",
  "providerMessage": "VERIFIED",
  "traceId": "trace-123"
}
```

### 1.4 Verify identity error
```json
{
  "verified": false,
  "providerCode": "NOT_FOUND",
  "providerMessage": "Citizen not found",
  "retryable": false,
  "traceId": "trace-456"
}
```

### 1.5 Health response
```json
{
  "status": "UP",
  "service": "mock-vneid",
  "version": "v1",
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

---

## 2) Mapping loi VNeID -> Auth Domain Error

| VNeID Provider Code | Auth Domain Error | HTTP |
|---|---|---|
| `INVALID_FORMAT`, `INVALID_NATIONAL_ID` | `AUTH_IDENTITY_INVALID` | 400 |
| `NOT_FOUND` | `AUTH_IDENTITY_NOT_FOUND` | 404 |
| `NAME_MISMATCH`, `DOB_MISMATCH`, `LOW_MATCH_SCORE` | `AUTH_IDENTITY_MISMATCH` | 401 |
| `BLOCKED_ID`, `DECEASED`, `INVALID_STATUS` | `AUTH_IDENTITY_BLOCKED` | 403 |
| `RATE_LIMITED` | `AUTH_PROVIDER_RATE_LIMITED` | 503 |
| `TIMEOUT` | `AUTH_PROVIDER_TIMEOUT` | 503 |
| `SERVICE_UNAVAILABLE` | `AUTH_PROVIDER_UNAVAILABLE` | 503 |
| `UNAUTHORIZED_API_KEY` | `AUTH_PROVIDER_UNAUTHORIZED` | 502 |
| `UNKNOWN` | `AUTH_PROVIDER_ERROR` | 502 |

Rule:
- Khong expose provider code/raw message ra external client.
- Bat buoc log noi bo `providerCode`, `traceId`, `requestId` de debug.

---

## 3) Implementation Plan

### Step 1: Chot contract va mapping loi
Phu thuoc: khong.
Ket qua:
- Contract `verify-identity` + `health` v1 duoc freeze.
- Bang mapping loi duoc approve va snapshot trong test.

### Step 2: Dung service `vneid-sandbox` doc lap
Phu thuoc: Step 1.
Song song duoc voi Step 3.
Nhiem vu:
- Bootstrap app.
- Env validation fail-fast.
- Request-id middleware.
- Error envelope thong nhat.

### Step 3: Fixture deterministic + endpoint mock
Phu thuoc: Step 1.
Song song duoc voi Step 2.
Nhiem vu:
- Tao fixture deterministic.
- Implement `POST /mock-vneid/v1/verify-identity`.
- Implement `GET /mock-vneid/v1/health`.
- Ho tro scenario: `success`, `not_found`, `invalid_status`, `rate_limited`, `timeout` (toggle).

### Step 4: Hoan thien auth core trong API
Phu thuoc: Step 2-3.
Nhiem vu:
- `POST /api/v1/auth/login`:
  - Goi sandbox verify.
  - Map loi.
  - Tao hoac doc user.
  - Phat JWT.
  - Tao session Redis.
- `POST /api/v1/auth/logout`:
  - Blacklist token/jti theo TTL.
  - Invalidate session.
- `GET /api/v1/auth/profile`:
  - JWT guard.
  - Check blacklist/session.

### Step 5: Wiring module + config
Phu thuoc: Step 4 (co the lam cuoi Step 4).
Nhiem vu:
- Dien provider/controller/guard cho auth module.
- Bo sung env contract fail-fast cho:
  - sandbox URL/API key
  - JWT secrets

### Step 6: Test gate increment
Phu thuoc: Step 4-5.
Nhiem vu:
- Unit test auth service + error mapper.
- Integration test 3 endpoint auth voi sandbox.
- Smoke:
  - sandbox health
  - auth happy path
  - unauthorized profile
  - logout invalidation

### Step 7: Chot deferred backlog
Phu thuoc: khong.
- OTP.
- Managed wallet provisioning/recovery.
- Blockchain boundary mo rong.
- Full CI hard-gate phase 0.

---

## 4) Verification Checklist

- Sandbox health tra envelope success on dinh.
- Verify identity deterministic cho happy path + 4 nhom loi.
- Login tra access token + profile cho CCCD hop le.
- Profile bi tu choi khi:
  - thieu token,
  - token het han,
  - token da blacklist.
- Logout lam token mat hieu luc ngay.
- Build/test cho phan da cham pass.

---

## 5) Database schema (sandbox) - 1 bang don gian nhung day du

### Bang: `vneid_identity_profiles`

```sql
CREATE TABLE vneid_identity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(12) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(16),
  nationality VARCHAR(64) DEFAULT 'VN',
  place_of_origin VARCHAR(255),
  place_of_residence VARCHAR(255),
  permanent_address VARCHAR(255),
  current_address VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(32) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  face_match_baseline_score SMALLINT NOT NULL DEFAULT 95,
  scenario_code VARCHAR(32) NOT NULL DEFAULT 'OK',
  scenario_message VARCHAR(255),
  response_delay_ms INT NOT NULL DEFAULT 0,
  is_deterministic BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vneid_profiles_status ON vneid_identity_profiles(status);
CREATE INDEX idx_vneid_profiles_scenario_code ON vneid_identity_profiles(scenario_code);
```

Giai thich:
- 1 bang duy nhat de don gian hoa increment.
- Van du thong tin nhan than co ban cua cong dan.
- `scenario_code` + `response_delay_ms` cho deterministic testing va timeout toggle.

---

## 6) Rationale
- Vertical slice nho gon giup release som auth core.
- Boundary VNeID tach rieng ngay tu dau de de nang cap OTP/wallet o sprint sau.
- Giam rui ro coupling do API consume sandbox qua contract co version va mapping loi ro rang.
