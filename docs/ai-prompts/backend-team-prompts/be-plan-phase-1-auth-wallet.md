## Phase 1 Plan: Auth + Wallet Foundation

### Goal
Deliver the minimum backend foundation that lets a user authenticate, get a session, link one wallet, and start a wallet recovery request.

### Scope
Must have:
- VNeID mock login flow.
- JWT/session handling with timeout and blacklist.
- Profile read/update.
- OTP flow for contact updates.
- 1-1 CCCD to wallet mapping.
- Wallet recovery request creation and status tracking.

Out of scope:
- Approval of wallet recovery.
- Multi-sig signing.
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
- `POST /api/v1/wallet/link`
- `POST /api/v1/wallet/recovery-request`
- `GET /api/v1/wallet/status`

### Required Rules
- One CCCD can map to one wallet only.
- One wallet can map to one user only.
- Recovery request stays in `Pending` until later phase approval.
- Expired JWT and OTP must be rejected consistently.

### Tables Touched
- `Roles`
- `Users`
- `Wallets`
- `Wallet_Recovery_Requests`
- `System_Logs`

### Test Gate
1. Login returns a valid JWT and profile.
2. Protected route rejects unauthenticated requests.
3. Wallet link succeeds once and fails on duplicate link.
4. OTP expires by TTL and respects rate limit.
5. Logout invalidates the current session/token.

### Dependencies
- Mock VNeID service.
- VNeID sandbox plan and response contract catalog.
- Redis or equivalent session store.
- DB migration for user and wallet tables.
- Shared DTO and enum definitions.

### VNeID Sandbox Acceptance
- Sandbox phai co cac scenario: success, not_found, locked, expired, duplicate, rate_limited.
- Sandbox phai tra response theo contract chung co `success`, `message`, `data`/`error`, `timestamp`, `request_id`, `trace_id`.
- Auth login chi duoc pass khi sandbox verify-identity pass.
- Wallet link chi duoc pass khi duplicate check tra `is_duplicate = false`.
- Moi failure cua sandbox phai duoc map sang domain error cua BE va ghi log.

### Notes
- Keep wallet module separate from auth module.
- Record all auth failures into logs for auditability.
- Use sandbox fixtures for deterministic auth tests.