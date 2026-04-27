## Phase 4 Plan: Transactions + Compliance + Fraud

### Goal
Let users create and sign land transactions, block unsafe transfers via compliance checks, and handle fraud reports that can lock or unlock NFT assets.

### Scope
Must have:
- Transaction draft and signing.
- Pre-check against planning, disputes, and mortgages.
- Fraud report creation and review.
- NFT lock/unlock flow based on fraud outcome.
- Dynamic tax/fee config update and audit.

Out of scope:
- Full reporting dashboard.
- Advanced export files.

### Backlog Mapping
- EP05/US06.
- EP09/US09, US28, US46.
- EP08/US17.

### API Contracts
- `POST /api/v1/transactions`
- `POST /api/v1/transactions/:id/sign`
- `POST /api/v1/transactions/:id/cancel`
- `GET /api/v1/transactions/:id`
- `GET /api/v1/compliance/disputes/:tokenId`
- `GET /api/v1/compliance/mortgages/:tokenId`
- `GET /api/v1/compliance/planning-zones`
- `POST /api/v1/fraud-reports`
- `PATCH /api/v1/fraud-reports/:id/resolve`
- `POST /api/v1/system-config/:key`
- `GET /api/v1/system-config/audits`

### Required Rules
- Pre-check must block if the asset is dangerous.
- Transaction must not bypass compliance checks.
- Fraud report must capture evidence links.
- Lock/unlock of NFT must be driven by review result.
- Config changes must be audited with old and new values.

### Tables Touched
- `Transactions`
- `Planning_Zones`
- `Land_Planning_Map`
- `Disputes`
- `Mortgages`
- `Fraud_Reports`
- `System_Configs`
- `System_Config_Audits`
- `Land_NFTs`

### Test Gate
1. Transaction is blocked when pre-check returns Danger.
2. Transaction signing is role-aware.
3. Fraud report can lock NFT.
4. Resolve flow can keep locked or restore normal state.
5. Config update affects later tax calculation and is logged.

### Dependencies
- Read access to compliance tables.
- Config service for tax/fee values.
- Notification hook for fraud review events.

### Notes
- Keep compliance queries optimized with indexes or cached lookups.
- Do not allow direct transaction completion without pre-check pass.