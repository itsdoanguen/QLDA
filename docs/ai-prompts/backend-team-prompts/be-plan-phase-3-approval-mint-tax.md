## Phase 3 Plan: Approval + Mint + Tax Core

### Goal
Collect Lãnh đạo signature on fully checked land records (`CB2_APPROVED`), mint NFT land assets only after Lãnh đạo signs, generate QR codes, and complete tax calculation plus payment confirmation.

### Scope
Must have:
- Pending approvals list (for Lãnh đạo to review `CB2_APPROVED` records).
- Sign/reject approval by Lãnh đạo (RBAC guarded).
- NFT mint STRICTLY triggered only after Lãnh đạo signature (`LEADER_SIGNED`).
- QR generation and verification base.
- Tax calculation and receipt creation.
- Payment callback handling.

Out of scope:
- Batch signing on-chain.
- Advanced public dashboard analytics.

### Backlog Mapping
- EP02/US08.
- EP02/US14.
- EP06/US05, US20.
- EP08/US07, US23.

### API Contracts
- `GET /api/v1/approvals/pending` (Lãnh đạo sees `CB2_APPROVED` records)
- `POST /api/v1/approvals/:id/sign` (Lãnh đạo signature)
- `POST /api/v1/approvals/:id/reject` (Lãnh đạo rejection)
- `POST /api/v1/nft/mint` (Triggered ONLY on `LEADER_SIGNED` records)
- `GET /api/v1/nft/:tokenId`
- `GET /api/v1/nft/owner/:wallet`
- `POST /api/v1/nft/:tokenId/qr-generate`
- `POST /api/v1/taxes/calculate`
- `POST /api/v1/taxes/payment-callback`
- `GET /api/v1/taxes/:id/receipt`

### Required Rules
- Lãnh đạo signature (`POST /api/v1/approvals/:id/sign`) is strictly guarded by `LANH_DAO` role.
- Only records with `CB2_APPROVED` status can be signed by Lãnh đạo.
- Upon Lãnh đạo signature, the record status becomes `LEADER_SIGNED`.
- `Mint` MUST only process records with `LEADER_SIGNED` status.
- Mint must persist tx hash and token ID.
- Tax calculation must read current config values.
- Payment callback must be idempotent.

### Tables Touched
- `Approval_Requests`
- `Signatures`
- `Land_NFTs`
- `Blockchain_Logs`
- `Taxes_Fees`
- `Receipts`

### Test Gate
1. Approval sign changes state correctly.
2. Reject returns record to the previous workflow state.
3. Mint creates NFT row and stores blockchain tx hash.
4. Tax calculation returns correct values from config.
5. Receipt is created only once per successful payment.

### Dependencies
- Smart contract ABI and deployed address.
- Ethers.js integration.
- QR generator utility.
- Payment gateway callback contract.
- Ethereum Sepolia RPC endpoint (QuickNode) and chain config (`chainId` = `11155111`, `rpcUrl`, confirm depth).
- Tx lifecycle handler in BE (submit/pending/confirmed/failed/reverted).
- Event sync strategy (contract events -> `Blockchain_Logs` + domain tables).

### Notes
- See `be-plan-blockchain-sepolia-quicknode.md` for BE integration baseline (env/config/error mapping/event sync).
- Keep minting logic separate from approval orchestration.
- If blockchain call fails, persist failure in blockchain logs.
- Explorer chi dung de tra cuu/doi chieu thu cong, khong dung lam nguon xu ly nghiep vu tu dong cho BE.