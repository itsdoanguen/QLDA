## Traceability Plan: Backlog to Backend

### Purpose
Map each important backlog item to backend endpoint(s), data tables, and test gate.

### Traceability Matrix

| Backlog | Backend Area | Primary Endpoint(s) | Data Tables | Test Gate |
|---|---|---|---|---|
| EP01/US01 | Auth | `/auth/login`, `/auth/logout`, `/auth/profile` | Users, Roles, System_Logs | JWT works, unauthorized blocked |
| EP01/US12 | Auth errors | `/auth/login` error handling | System_Logs | Error mapped correctly |
| EP01/US34 | Session end | `/auth/logout` | System_Logs, Users | Token invalidated |
| EP01/US40 | Contact update | `/auth/send-otp`, `/auth/verify-otp` | Users | OTP TTL and rate limit |
| EP04/US02 | Managed wallet provisioning | `/auth/verify-otp` | Wallets, Wallet_Secrets | Auto provision and 1-1 mapping enforced |
| EP04/US15 | Wallet recovery | `/wallet/recovery-request` | Wallet_Recovery_Requests | Pending state created |
| EP03/US03 | Pinata-IPFS upload | `/files/upload` | Land_Files | CID stored and retrievable |
| EP03/US13 | Pinata retry policy | `/files/upload` | Land_Files, System_Logs | Retry stops after 3 failures |
| EP07/US04 | Cleansing draft | `/land-records/:id`, `/land-records/:id/freeze` | Land_Records, Land_Record_Versions | Draft/freeze works |
| EP07/US23 | Reject reason | `/land-records/:id/reject` | Land_Records, System_Logs | Reject requires reason |
| EP07/US42 | Supplement request | `/land-records/:id/request-supplement` | Land_Records, Notifications | Status changes and notifies |
| EP02/US08 | Multi-sig | `/approvals/*` | Approval_Requests, Signatures | Threshold enforced |
| EP02/US14 | Revert approval | `/approvals/:id/reject` | Approval_Requests | State rolled back |
| EP06/US05 | Mint NFT via Ethereum Sepolia RPC (QuickNode) | `/nft/mint` | Land_NFTs, Blockchain_Logs | Tx hash stored |
| EP06/US20 | Owned NFTs | `/nft/owner/:wallet` | Land_NFTs | Owner list correct |
| EP08/US07 | Tax calc | `/taxes/calculate` | Taxes_Fees, System_Configs | Correct formula |
| EP08/US17 | Config changes | `/system-config/:key` | System_Configs, System_Config_Audits | Audit record created |
| EP05/US06 | Pre-check | `/compliance/pre-check` | Planning_Zones, Land_Planning_Map, Disputes, Mortgages | Safe/Warning/Danger |
| EP09/US09 | QR verify | `/nft/:tokenId/qr-generate` and verify route | Land_NFTs, Blockchain_Logs | QR resolves correctly |
| EP09/US46 | Fraud report | `/fraud-reports`, `/fraud-reports/:id/resolve` | Fraud_Reports, Land_NFTs | NFT lock flow works |
| EP10/US10 | Provenance | provenance route | Cached_Provenance_Logs, Blockchain_Logs | Timeline matches chain |

### Usage Rules
1. Any new endpoint must map to at least one backlog item.
2. Any backlog item marked MVP must have a test gate.
3. Deferred backlog items should be listed separately and not mixed into phase gates.

### Notes
- Keep this file updated when adding or removing backend endpoints.
- If a backlog item has no endpoint, it belongs to another team or to a later phase.