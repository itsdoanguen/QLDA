## Phase 1 Plan: Auth + Managed Wallet Foundation

### Goal
Deliver the minimum backend foundation where user verifies identity via VNeID OTP, receives a valid session, and is automatically provisioned a managed custodial wallet.

### Scope
Must have:
- VNeID mock login flow.
- JWT/session handling with timeout and blacklist.
- Profile read/update.
- OTP flow for contact updates.
- Auto wallet provisioning after successful verify-otp.
- Encrypted private key storage (custodial, managed by system).
- Wallet recovery request creation and status tracking.

Out of scope:
- Approval of wallet recovery.
- Meta-transaction, paymaster, or relayer execution.
- Land, IPFS, mint, transaction, and compliance flows.

### Backlog Mapping
- EP01/US01: T01.1, T01.3, T01.4, T01.5, T01.6, T01.8.
- EP01/US12: T12.1, T12.3.
- EP01/US34: T34.3.
- EP01/US40: T40.3, T40.4, T40.6, T40.7.
- EP04/US02: T04.3, T04.4, T04.5.
- EP04/US15: T15.1, T15.4, T15.6.

### API Contracts
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/profile`
- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/wallet/recovery-request`
- `GET /api/v1/wallet/status`

Removed from Phase 1:
- `POST /api/v1/wallet/link`

### Required Rules
- One CCCD maps to one user.
- One user maps to one active managed wallet.
- One wallet address maps to one user only.
- Wallet is auto-created after verify-otp success if not existed.
- Recovery request stays in `Pending` until later phase approval.
- Expired JWT and OTP must be rejected consistently.

### Tables Touched
- `Roles`
- `Users`
- `Wallets`
- `Wallet_Secrets` (or equivalent secure wallet secret table)
- `Wallet_Recovery_Requests`
- `System_Logs`

### Data Model Changes
- `wallets` table extended for managed wallet metadata.
- New wallet secret storage table for encrypted private key payload:
	- `encrypted_private_key`
	- `iv`
	- `auth_tag`
	- `algorithm`
	- `key_version`
- No plaintext private key in DB/logs/response.

### Security Baseline
- AES-256-GCM encryption for private key.
- Master key from env/secret manager only.
- Key versioning for future rotation.
- Strict log redaction for sensitive fields.

### Test Gate
1. Login returns a valid JWT and profile.
2. Protected route rejects unauthenticated requests.
3. verify-otp auto-creates wallet exactly once for first login.
4. verify-otp does not create duplicate wallet for existing user.
5. OTP expires by TTL and respects rate limit.
6. Logout invalidates the current session/token.

### Dependencies
- Mock VNeID service.
- VNeID sandbox plan and response contract catalog.
- Redis or equivalent session store.
- DB migration for user, wallet, and wallet secret tables.
- `ethers` dependency in `apps/api`.
- Shared DTO and enum definitions.

### VNeID Sandbox Acceptance
- Sandbox phai co cac scenario: success, not_found, locked, expired, duplicate, rate_limited.
- Sandbox phai tra response theo contract chung co `success`, `message`, `data`/`error`, `timestamp`, `request_id`, `trace_id`.
- Auth login chi duoc pass khi sandbox verify-identity pass.
- verify-otp chi duoc pass khi wallet auto-provision thanh cong (hoac user da co wallet hop le).
- Moi failure cua sandbox phai duoc map sang domain error cua BE va ghi log.

### Notes
- Keep wallet module separate from auth module.
- Auth service orchestrates wallet provisioning via wallet service (`ensureManagedWallet`).
- Record all auth failures into logs for auditability.
- Use sandbox fixtures for deterministic auth tests.
- Gasless execution remains a next-phase task; only env/interface groundwork is prepared here.