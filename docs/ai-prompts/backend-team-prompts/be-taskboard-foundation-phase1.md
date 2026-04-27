## BE Taskboard Plan (Foundation Sprint + Phase 1)

### Muc tieu
Taskboard nay chuyen sprint plan thanh checklist theo ngay de team BE 3-4 nguoi trien khai va theo doi tien do.

### Quy uoc
- Trang thai: `TODO` | `IN_PROGRESS` | `BLOCKED` | `DONE`
- Owner: `A` (API/Auth), `B` (DB/Wallet), `C` (Shared-types/Test), `D` (Infra/CI)
- Rule: Khong bat dau task co dependency neu task truoc do chua `DONE`.

---

## 0. Hard Foundation Remediation (bat buoc truoc Day 4)

1. [ ] `TODO` Owner A - Chot root scripts (`dev`, `build`, `lint`, `test`, `db:migrate:up`, `db:migrate:down`, `db:migrate:status`).
2. [ ] `TODO` Owner A - Chot turbo pipeline (`build/lint/test/dev`) va cache strategy.
3. [ ] `TODO` Owner A - Hoan tat API bootstrap (prefix, validation, exception filter, request id).
4. [ ] `TODO` Owner B - Chot TypeORM DataSource + migration folder convention.
5. [ ] `TODO` Owner C - Chot shared-types skeleton (`auth/wallet/user/api-response/error-catalog`).
6. [ ] `TODO` Owner D - Chot external stubs baseline (VNeID/Redis/Pinata-IPFS) va smoke checks.
7. [ ] `TODO` Owner A/D - Tao policy docs v0.1 cho NFR/Security/DevOps (SLO/JWT secret/rollback/monitoring).

Hard gate verification (run bat buoc):
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run db:migrate:up`
- [ ] `npm run db:migrate:down`
- [ ] Health check `/api/v1/health` = 200

Exit criteria muc 0:
- [ ] Khong con blocker foundation de vao coding feature.
- [ ] Co checklist evidence trong PR mo dau sprint.

---

## Day 1 - Readiness Lock

1. [ ] `TODO` Owner A/C - Chot API convention (`/api/v1`, response envelope, error code format).
2. [ ] `TODO` Owner C - Chot DTO naming + enum naming conventions.
3. [ ] `TODO` Owner A - Chot audit log format cho auth va wallet actions.
4. [ ] `TODO` Owner A/B/C/D - Chot Definition of Ready cho endpoint task.

Exit criteria Day 1:
- [ ] Team convention duoc thong nhat, khong con conflict.
- [ ] DoR duoc note va ap dung cho task moi.

---

## Day 1-2 - Workspace + Runtime Bootstrap (Critical Path)

1. [ ] `TODO` Owner A - Hoan thien root scripts (`dev`, `build`, `lint`, `test`, `db:migrate:up`, `db:migrate:down`, `db:migrate:status`).
2. [ ] `TODO` Owner A - Hoan thien `turbo.json` pipeline cho app/package.
3. [ ] `TODO` Owner A - Bootstrap `apps/api/src/main.ts` (global prefix, validation, filter co ban).
4. [ ] `TODO` Owner A - Bootstrap `apps/api/src/app.module.ts` (module wiring co ban).
5. [ ] `TODO` Owner D - Tao `.env.example` cho DB/Redis/JWT/PINATA-IPFS/RPC/contracts/payment/VNEID.
6. [ ] `TODO` Owner A/D - Them env validation schema va fail-fast khi thieu bien critical.

Dependencies:
- Day 1 convention `DONE` truoc khi khoa scripts va bootstrap.

Exit criteria Day 2:
- [ ] Workspace install/build chay duoc.
- [ ] API app boot duoc o local.
- [ ] Lint pass va health endpoint tra 200.

---

## Day 2-3 - Data + Contract Baseline

1. [ ] `TODO` Owner B - Chot ORM/migration strategy (de xuat TypeORM).
2. [ ] `TODO` Owner B - Tao migration Phase 1 tables: `Roles`, `Users`, `Wallets`, `Wallet_Recovery_Requests`, `System_Logs`.
3. [ ] `TODO` Owner C - Tao shared contract package: `api-response`, `user`, `auth`, `wallet`.
4. [ ] `TODO` Owner C - Tao error catalog mapping (`domain_code -> http_status -> message_key`).
5. [ ] `TODO` Owner A/C - Tich hop shared-types vao API layer.
6. [ ] `TODO` Owner B - Chot migration naming convention (timestamp + domain).

Dependencies:
- Bootstrap Day 1-2 phai `DONE`.

Exit criteria Day 3:
- [ ] Migration up/down pass local Postgres.
- [ ] Shared-types compile va import duoc trong API.
- [ ] Khong co contract drift giua API response va shared-types.

---

## Day 3-4 - External Stub Baseline

1. [ ] `TODO` Owner D - Implement VNeID mock adapter cho login flow.
2. [ ] `TODO` Owner D - Cau hinh Redis session/token blacklist + TTL policy.
3. [ ] `TODO` Owner D - Tao Pinata adapter + IPFS abstraction + retry max 3 cho loi retryable.
4. [ ] `TODO` Owner D/A - Tao blockchain boundary interface (provider/signer/abi loader) cho Ethereum Sepolia RPC (QuickNode).
5. [ ] `TODO` Owner C - Viet smoke checks cho VNeID/Redis/Pinata-IPFS adapters.
6. [ ] `TODO` Owner D - Chot timeout/retry policy cho VNeID va Pinata-IPFS (max retry, backoff co ban).
7. [ ] `TODO` Owner A/D - Chot responsibility split Ethereum Sepolia (Blockchain: contract/deploy/ABI cho Sepolia, BE: RPC/tx lifecycle/event sync qua QuickNode).

Dependencies:
- Data + Contract baseline `DONE`.

Exit criteria Day 4:
- [ ] Cac dependency stub check `PASS`.
- [ ] Khong con blocker Foundation de vao Phase 1 coding.
- [ ] Team da review policy v0.1 (NFR/Security/DevOps).

---

## Day 4-8 - Phase 1 Implementation (Auth + Wallet)

### Auth module
1. [ ] `TODO` Owner A - `POST /api/v1/auth/login`
2. [ ] `TODO` Owner A - `POST /api/v1/auth/logout`
3. [ ] `TODO` Owner A - `GET /api/v1/auth/profile`
4. [ ] `TODO` Owner A - `POST /api/v1/auth/send-otp`
5. [ ] `TODO` Owner A - `POST /api/v1/auth/verify-otp` va trigger `ensureManagedWallet(userId)`

### Wallet module
6. [ ] `TODO` Owner B - Remove `POST /api/v1/wallet/link` khoi controller, swagger, va test.
7. [ ] `TODO` Owner B - Add managed wallet provisioning service (idempotent).
8. [ ] `TODO` Owner B - `POST /api/v1/wallet/recovery-request`
9. [ ] `TODO` Owner B - `GET /api/v1/wallet/status`

### Rules implementation
10. [ ] `TODO` Owner A/B - Enforce `1 user <-> 1 wallet` voi DB unique constraints + service guard.
11. [ ] `TODO` Owner A - OTP TTL + rate limit.
12. [ ] `TODO` Owner A/D - Logout invalidates token/session.
13. [ ] `TODO` Owner B - Recovery request default `Pending`.
14. [ ] `TODO` Owner B - Introduce encrypted private key storage voi `key_version` va audit-safe logging.

### Docs
15. [ ] `TODO` Owner C - Swagger docs cho tat ca endpoints Phase 1.

Dependencies:
- Foundation sprint tasks Day 1-4 phai `DONE`.

Exit criteria Day 8:
- [ ] Tat ca endpoint Phase 1 da implement va test basic pass.

---

## Day 8-10 - Test Gate + Go/No-Go

1. [ ] `TODO` Owner C - Unit tests cho auth/wallet services.
2. [ ] `TODO` Owner C - Integration tests cho auth/wallet endpoints.
3. [ ] `TODO` Owner C/A - E2E slice: login -> verify-otp (auto wallet) -> recovery request -> logout.
4. [ ] `TODO` Owner D - Kiem tra logging/audit cho auth failures.
5. [ ] `TODO` Owner A/B/C/D - Gate review va quyet dinh Go/No-Go.

Phase 1 Test Gates (bat buoc pass):
- [ ] Login tra JWT hop le va profile.
- [ ] Route bao ve tu choi request khong auth.
- [ ] verify-otp auto provision wallet cho first login.
- [ ] verify-otp khong tao duplicate wallet cho existing user.
- [ ] `wallet/link` route khong con expose.
- [ ] OTP het han theo TTL va ton trong rate limit.
- [ ] Logout vo hieu hoa token/session hien tai.

Release decision:
- [ ] `GO` khi tat ca test gates pass va khong con bug high severity.
- [ ] `NO_GO` neu con fail gate hoac loi nghiem trong.

---

## Daily Ritual (khuyen nghi)

1. [ ] 09:00 - 15 phut sync nhanh blocker/dependency.
2. [ ] 13:30 - Cap nhat trang thai task (`TODO/IN_PROGRESS/BLOCKED/DONE`).
3. [ ] 17:00 - Chot ket qua trong ngay + ke hoach ngay tiep theo.

---

## Risk Watchlist

1. [ ] Contract drift giua API va shared-types.
2. [ ] Migration loi do schema mismatch.
3. [ ] Redis/Pinata-IPFS mock pass nhung integration that bai.
4. [ ] Rule 1-1 wallet mapping bi bypass trong edge case.
5. [ ] OTP rate limit khong on dinh khi concurrent requests.
6. [ ] Chua co rollback/monitoring baseline nen release gate mo ho.

Neu gap risk o muc cao: danh dau `BLOCKED`, tao issue, va escalates trong ngay.