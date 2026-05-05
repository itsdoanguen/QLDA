## Phase 2 Plan: Land Records + IPFS + Data Cleansing + RBAC (Cán bộ)

### Goal
Implement Staff Role-Based Access Control (Admin, Cán bộ). Let a user submit a land record draft, upload scan files to IPFS, and let Cán bộ perform a strict data cleansing and checking process before Lãnh đạo approval.

### Scope
Must have:
- RBAC Middleware (`RolesGuard`) for Staff roles (`ADMIN`, `CAN_BO`).
- Staff Account Management CRUD (for Admin).
- Draft creation (Citizen) and state transitions (`SUBMITTED` -> `CB_APPROVED` -> `NEEDS_SUPPLEMENT`).
- File upload to Pinata-backed IPFS with retry.
- CID storage and retrieval.
- Version history.
- Staff actions: Cán bộ checks, request supplement, reject with reason, update GPS.
- Base pre-check query for planning/dispute/mortgage.

Out of scope:
- Lãnh đạo signing (Moved to Phase 3).
- Minting NFT.
- Transaction signing.
- PDF export of cleansing report.

### Backlog Mapping
- EP03/US03: T03.3, T03.4, T03.5, T03.6.
- EP03/US13: T13.3, T13.4.
- EP07/US04, US21, US23, US32, US36, US42.
- EP05/US06: pre-check query core.

### API Contracts
- `POST /api/v1/land-records` (Create Draft)
- `POST /api/v1/land-records/:id/submit` (Submit for Review & Random Assignment)
- `PUT /api/v1/land-records/:id`
- `GET /api/v1/land-records/:id/versions`
- `GET /api/v1/land-records`
- `POST /api/v1/files/upload`
- `GET /api/v1/files/:id`
- `DELETE /api/v1/files/:id`
- `POST /api/v1/land-records/:id/review` (Cán bộ - Freezes record upon approval)
- `POST /api/v1/land-records/:id/request-supplement`
- `POST /api/v1/land-records/:id/reject`
- `PATCH /api/v1/land-records/:id/update-gps`
- `POST /api/v1/compliance/pre-check`
- `POST /api/v1/staff` (Admin)
- `GET /api/v1/staff` (Admin)
- `PATCH /api/v1/staff/:id/deactivate` (Admin)

### Required Rules
- A new record is initially created with `DRAFT` status.
- Upon calling the submit endpoint, the record transitions to `SUBMITTED` status and is randomly assigned to an active user with the `CAN_BO` role.
- `CAN_BO` personnel can only view and interact with records that are explicitly assigned to them.
- Only records with `SUBMITTED` status can be reviewed by `CAN_BO`.
- Upon `CAN_BO` approval, the record becomes frozen (`isFrozen = true`) and moves to `CB_APPROVED` status.
- A frozen record cannot be edited by the citizen.
- Reject and supplement actions require a non-empty reason and return the record to `NEEDS_SUPPLEMENT`.
- GPS update must pass format validation before saving.
- Pinata upload should retry up to 3 times for retryable errors and then fail gracefully.
- API response for file upload must expose normalized fields (`cid`, `fileName`, `mimeType`, `size`) only.
- A background Cronjob should run periodically to find abandoned `DRAFT` records (e.g., inactive for > 7 days), call Pinata's `unpin` API to clean up junk files, and delete the draft from the database.

### Tables Touched
- `Land_Records` (Requires adding `cb_id` to track random assignment)
- `Land_Record_Versions`
- `Land_Files`
- `Planning_Zones`
- `Land_Planning_Map`
- `System_Logs`

### Test Gate
1. Draft create/update works and versions are recorded.
2. Upload returns a CID and can be retrieved later.
3. Upload timeout/429/5xx from Pinata retries up to max 3 and logs all attempts.
4. Freeze blocks further edits.
5. Reject without reason fails validation.
6. Pre-check returns Safe, Warning, or Danger as expected.

### Dependencies
- Pinata client adapter + IPFS abstraction interface.
- Pinata gateway policy (public/private gateway, cache TTL, fallback gateway).
- File validation rules for size and type.
- Shared DTOs for land and file requests.
- Geo validation helper for GPS/polygon inputs.

### Notes
- This phase is the quality gate before approval.
- Keep cleansing logic strict; do not auto-approve invalid geometry.
- Khong de business flow phu thuoc truc tiep vao response raw cua Pinata.