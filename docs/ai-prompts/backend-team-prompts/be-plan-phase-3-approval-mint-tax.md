## Phase 3 Plan: Approval + Mint + Tax Core

### Goal
Collect multi-sig approvals, mint NFT land assets, generate QR codes, and complete tax calculation plus payment confirmation.

### Scope
Must have:
- Pending approvals list.
- Sign/reject/finalize approval.
- NFT mint after threshold.
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
- `GET /api/v1/approvals/pending`
- `POST /api/v1/approvals/:id/sign`
- `POST /api/v1/approvals/:id/reject`
- `POST /api/v1/approvals/:id/finalize`
- `POST /api/v1/nft/mint`
- `GET /api/v1/nft/:tokenId`
- `GET /api/v1/nft/owner/:wallet`
- `POST /api/v1/nft/:tokenId/qr-generate`
- `POST /api/v1/taxes/calculate`
- `POST /api/v1/taxes/payment-callback`
- `GET /api/v1/taxes/:id/receipt`

### Required Rules
- Approval sign order must be enforced by role.
- Finalize only when threshold is met.
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