## BE Execution-Ready Sprint Plan (Foundation + Phase 1)

### Muc tieu
Chuyen bo plan hien tai tu muc dinh huong sang muc co the trien khai code ngay cho team BE 3-4 nguoi.

### Pham vi sprint nay
Bao gom:
- Foundation Sprint de go blocker ky thuat.
- Implementation Phase 1 (Auth + Wallet).
- Test gate va go/no-go truoc khi vao Phase 2.

Khong bao gom:
- Feature nghiep vu Phase 2 tro di (land/ipfs cleansing, approval, mint, transaction).

---

## 0. Hard Foundation Patch (phan cung nen can khoa truoc)

Muc nay dung de sua cac diem "chua du code feature ngay" bang cac dau viec co the verify bang lenh.

### 0.1 Build/Workspace Baseline
- Chot scripts bat buoc trong root `package.json`:
  - `dev`, `build`, `lint`, `test`
  - `db:migrate:up`, `db:migrate:down`, `db:migrate:status`
- Chot pipeline bat buoc trong `turbo.json`:
  - `build` phu thuoc `^build`
  - `lint`, `test` co cache
  - `dev` non-cache va persistent

Verification:
- `npm install`
- `npm run build`
- `npm run lint`

### 0.2 Runtime Bootstrap Baseline
- `apps/api/src/main.ts` bat buoc co:
  - global prefix `/api/v1`
  - validation pipe toan cuc
  - exception filter co ban
  - request id middleware (de trace log)
- `apps/api/src/app.module.ts` bat buoc wire toi thieu:
  - Config module
  - Database module
  - Auth module
  - Wallet module
  - Health module

Verification:
- `npm run dev`
- `GET /api/v1/health` tra 200

### 0.3 Config + Secrets Baseline
- Tao `.env.example` day du nhom bien:
  - DB, REDIS, JWT, PINATA/IPFS, RPC, CONTRACT, VNEID, PAYMENT
- Chot bo bien PINATA toi thieu:
  - `PINATA_JWT`
  - `PINATA_API_BASE`
  - `PINATA_GATEWAY_BASE`
- Tao schema validate env (startup fail fast neu thieu bien quan trong).
- Tach bien cho local/dev/test de tranh dung nham secret.

Verification:
- App khoi dong fail dung cach neu thieu env critical.
- App khoi dong thanh cong khi du env.

### 0.4 Data + Migration Baseline
- Chot TypeORM data source + folder migration.
- Tao migration Phase 1 cho 5 bang core:
  - Roles, Users, Wallets, Wallet_Recovery_Requests, System_Logs
- Chot convention migration:
  - dat ten theo timestamp + domain
  - khong sua file migration da merge

Verification:
- `npm run db:migrate:up`
- `npm run db:migrate:status`
- `npm run db:migrate:down`

### 0.5 Shared Contract Baseline
- `packages/shared-types` bat buoc co:
  - `auth`, `wallet`, `user`, `api-response`, `error-catalog`
- API layer dung DTO/error shape tu shared package, khong tu tao schema rieng.

Verification:
- Shared package compile pass.
- API import shared-types khong cycle/lint error.

### 0.6 External Stub Baseline
- VNeID mock endpoint bat buoc:
  - verify identity
  - duplicate check
  - profile by CCCD
- Redis baseline:
  - session store
  - token blacklist
  - TTL policy
- Pinata-backed IPFS baseline:
  - abstraction interface (khong de business logic phu thuoc response rieng cua Pinata)
  - upload pin tra CID
  - retry max 3 cho loi retryable (timeout/5xx/429)
  - fail fast cho loi non-retryable (401/403/validation)
- Blockchain boundary baseline (BE side):
  - provider/signer/abi loader cho RPC Ethereum Sepolia (via QuickNode)
  - tx lifecycle handler (submit -> pending -> confirmed/failed)
  - event/indexer hook de dong bo on-chain -> off-chain log

Verification:
- Smoke check cho VNeID/Redis/Pinata-IPFS pass trong CI.

### 0.7 NFR/Security/DevOps Minimum (chi can muc toi thieu de mo khoa)
- NFR toi thieu:
  - define SLO tam thoi cho auth/profile (P95 local/staging)
- Security toi thieu:
  - JWT expiry + refresh policy
  - secret rotation policy draft
  - secret rotation policy cho `PINATA_JWT`
  - audit log truong bat buoc
- DevOps toi thieu:
  - rollback playbook 1 trang
  - monitoring baseline (app up/down, error rate, latency)

Verification:
- Co tai lieu policy version 0.1 duoc team review va chap thuan.

Definition of Done cho muc 0:
- Khong con blocker "foundation" de bat dau coding Phase 1.
- Co bang chung verify (command output/checklist) trong PR.

---

## 1. Timeline Day 1-10

### Day 1: Readiness Lock
- Chot standards dung chung:
  - API prefix: `/api/v1`
  - Response envelope va error code convention
  - DTO naming va enum naming rule
  - Audit log format cho action nhay cam
- Chot Definition of Ready (DoR) cho task endpoint.

Deliverable:
- Team convention duoc thong nhat va dung chung khi code.

### Day 1-2: Workspace + Runtime Bootstrap (Critical Path)
- Hoan thien root workspace scripts trong `package.json`.
- Hoan thien pipeline trong `turbo.json` (build/lint/test/dev).
- Bootstrap API runtime trong `apps/api/src/main.ts` va `apps/api/src/app.module.ts`.
- Tao `.env.example` cho DB/Redis/JWT/PINATA-IPFS/RPC/contract/payment callback.

Deliverable:
- Workspace install/build chay duoc.
- API app boot duoc o local.

### Day 2-3: Data + Contract Baseline
- Chon ORM va migration strategy (de xuat: TypeORM).
- Tao migration cho bang Phase 1:
  - Roles
  - Users
  - Wallets
  - Wallet_Recovery_Requests
  - System_Logs
- Tao shared DTO/contracts toi thieu trong `packages/shared-types`:
  - auth
  - wallet
  - user
  - api response

Deliverable:
- Migration up/down pass local.
- Shared types compile va duoc import tu API layer.

### Day 3-4: External Stub Baseline
- VNeID mock adapter (deterministic test flow).
- Redis session/token blacklist + TTL policy.
- Pinata adapter + IPFS abstraction + retry toi da 3 lan.
- Blockchain boundary interface (provider/signer/abi loader), chua can feature mint.
- Ethereum Sepolia integration responsibility split:
  - Blockchain team: contract, deploy, ABI/address (cho Sepolia testnet).
  - BE team: goi RPC Sepolia qua QuickNode, quan ly tx lifecycle, map loi chain sang domain error, dong bo event.

Deliverable:
- Health checks/stub checks pass cho cac dependency tren.

### Day 4-8: Phase 1 Implementation
- Auth endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/profile`
  - `POST /api/v1/auth/send-otp`
  - `POST /api/v1/auth/verify-otp` (auto provision managed wallet)
- Wallet endpoints:
  - `POST /api/v1/wallet/recovery-request`
  - `GET /api/v1/wallet/status`
- Enforce rules:
  - 1 user <-> 1 active wallet
  - OTP TTL + rate limit
  - logout invalidate token/session
  - recovery request mac dinh Pending
  - encrypted private key storage with key version

Deliverable:
- Toan bo endpoint Phase 1 chay va co Swagger docs.

### Day 8-10: Test Gate + Release Decision
- Unit + integration test cho toan bo rule Phase 1.
- E2E slice: login -> verify-otp (auto wallet) -> recovery request -> logout.
- Security + audit check cho auth failures.
- Go/No-Go:
  - Go neu pass du 5 test gate va khong con bug high severity.
  - No-Go neu con fail gate hoac loi nghiem trong.

Deliverable:
- Bien ban ket qua gate va quyet dinh vao Phase 2.

---

## 2. Team split cho 3-4 nguoi

- Engineer A: API bootstrap + Auth module.
- Engineer B: DB migration + Wallet module.
- Engineer C: shared-types + test harness + Swagger docs.
- Engineer D (neu co): Redis/IPFS/VNeID stubs + CI checks.

Rule phoi hop:
- Daily checkpoint de chot contract va tranh drift.
- Khong merge PR neu chua pass build/lint/test toi thieu.

---

## 3. Definition of Ready (DoR) cho endpoint task

Moi task endpoint chi duoc start khi dat du cac dieu kien:
1. Da map backlog item trong traceability file.
2. Da co DTO request/response va error cases.
3. Da co DB table/schema lien quan (hoac migration).
4. Da ro role access (RBAC) va auth requirement.
5. Da co test cases (happy path + validation + unauthorized).

---

## 4. Entry Criteria truoc khi code Phase 1

- `package.json` khong con rong; co scripts cho workspace.
- `turbo.json` khong con rong; co pipeline toi thieu.
- `apps/api/src/main.ts` va `apps/api/src/app.module.ts` co bootstrap that su.
- `packages/shared-types/*` co noi dung va compile duoc.
- DB migration Phase 1 chay thanh cong.
- VNeID mock + Redis + Pinata-backed IPFS abstraction san sang.
- Co NFR/Security/DevOps minimum docs (v0.1) va team da chap thuan.

Lenh gate bat buoc (run tren workspace):
1. `npm run build`
2. `npm run lint`
3. `npm run test`
4. `npm run db:migrate:up`
5. `npm run db:migrate:down`
6. Health check `GET /api/v1/health`

Neu mot trong cac dieu kien tren chua dat, khong bat dau coding feature nghiep vu.

---

## 5. Exit Criteria cho Foundation Sprint

Foundation Sprint duoc xem la done khi:
1. API app boot duoc + ping health route.
2. Migration up/down pass tren local Postgres.
3. Shared contract package duoc import va dung trong API.
4. Stub dependencies pass smoke check.
5. CI toi thieu (lint + unit + integration smoke) chay xanh.
6. Team da ky nhan policy v0.1 cho NFR/Security/DevOps.

---

## 6. Link voi bo plan phase

- Sau khi pass Foundation + Phase 1 gate, tiep tuc theo:
  - `be-plan-blockchain-sepolia-quicknode.md`
  - `be-plan-phase-2-land-ipfs-cleansing.md`
  - `be-plan-phase-3-approval-mint-tax.md`
  - `be-plan-phase-4-transactions-compliance-fraud.md`
  - `be-plan-phase-5-hardening-release.md`

- Luon doi chieu voi:
  - `be-plan-traceability-backlog.md`
  - `docs/architecture/database-spec.md`

---

## 7. Ghi chu quan trong

- Khong mo rong scope trong Foundation Sprint.
- Muc tieu sprint nay la "san sang code + chay duoc Phase 1".
- Tat ca quyet dinh ky thuat trong sprint nay uu tien tinh on dinh va kha nang giao tiep giua cac team (BE/FE/Blockchain).