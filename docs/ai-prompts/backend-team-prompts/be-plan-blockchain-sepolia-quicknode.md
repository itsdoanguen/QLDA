## BE Plan: Blockchain Integration Baseline (Ethereum Sepolia + QuickNode)

### Muc tieu
Chot single source of truth cho huong tich hop blockchain BE trong giai doan dev/staging khi su dung Ethereum Sepolia qua QuickNode.

### Scope
Bao gom:
- RPC/network config cho BE.
- Tx lifecycle + event sync baseline.
- Error mapping co ban tu JSON-RPC/QuickNode sang domain error.
- Smoke checks toi thieu cho CI.

Khong bao gom:
- Rewrite contract business logic.
- Quy trinh deploy contract chi tiet cho blockchain team.

---

## 1. Network va provider baseline

- Network: `Ethereum Sepolia Testnet`
- Provider: `QuickNode`
- Chain ID: `11155111`
- Explorer doi chieu: `https://sepolia.etherscan.io`

Env toi thieu de BE khoi tao:
- `RPC_URL=https://sepolia.rpc.quicknode.pro/<api-key>`
- `CHAIN_ID=11155111`
- `LAND_REGISTRY_CONTRACT_ADDRESS=<deployed-address>`
- `LAND_NFT_CONTRACT_ADDRESS=<deployed-address>`

Khuyen nghi:
- Fail-fast neu `CHAIN_ID` khong khop `11155111` trong profile dev/staging.
- Khong hardcode RPC URL trong source code.

---

## 2. Ranh gioi trach nhiem

- Blockchain team:
  - Design/review contract.
  - Deploy contract len Sepolia.
  - Ban giao ABI + address theo environment.
- BE team:
  - Goi RPC Sepolia qua QuickNode.
  - Quan ly tx lifecycle (`submit -> pending -> confirmed/failed/reverted`).
  - Dong bo event on-chain ve bang off-chain (`Blockchain_Logs` + domain tables).
  - Map loi chain sang domain errors/API errors.

---

## 3. Tx lifecycle baseline (BE)

1. Submit:
- Tao tx request, estimate gas, send tx.
- Persist `tx_hash`, `status=submitted`, `request_id`, `actor`.

2. Pending:
- Poll hoac subscribe receipt theo `tx_hash`.
- Cap nhat `status=pending` neu chua co receipt.

3. Confirmed/Failed/Reverted:
- Confirmed khi receipt success va dat confirm depth.
- Failed/Reverted khi receipt status fail, out-of-gas, hoac nonce conflict.
- Persist full error context cho audit/debug.

Confirm depth khuyen nghi:
- Dev local check: 1-2 blocks.
- Staging gate: 6-12 blocks (default 12 cho tai lieu policy).

---

## 4. Event sync baseline (BE)

- Nguon su that nghiep vu: DB off-chain + event da index, khong dung explorer lam data source nghiep vu.
- Dong bo event theo block window:
  - Luu `last_processed_block`.
  - Re-scan overlap nho de tranh mat event khi reconnect.
- Idempotency:
  - Upsert theo (`tx_hash`, `log_index`) de tranh ghi trung.
- Khi dong bo fail:
  - Ghi `System_Logs` + retry co gioi han.

---

## 5. Error mapping baseline (QuickNode/RPC -> Domain)

Map toi thieu:
- HTTP `429` -> `UPSTREAM_RATE_LIMITED`
- Timeout/network error -> `CHAIN_RPC_UNAVAILABLE`
- JSON-RPC `-32000` (generic execution) -> `CHAIN_EXECUTION_FAILED`
- `insufficient funds` -> `CHAIN_INSUFFICIENT_FUNDS`
- `nonce too low` -> `CHAIN_NONCE_CONFLICT`

Yeu cau:
- Log day du `request_id`, `method`, `tx_hash`, `chain_id`, `rpc_host`.
- Tra error code on dinh cho FE, khong expose raw provider message truc tiep.

---

## 6. Smoke checks bat buoc

1. Provider health:
- Goi `eth_chainId` va verify `11155111`.

2. Contract reachability:
- Read-only call 1 ham view tren moi contract chinh.

3. Tx dry run:
- Estimate gas + send 1 tx test trong sandbox/staging profile.

4. Event sync:
- Phat sinh event mau, xac nhan event vao `Blockchain_Logs` trong SLA noi bo.

5. Error path:
- Gia lap 429/timeout de verify retry + mapping.

---

## 7. Link voi cac plan khac

- `be-execution-ready-sprint-plan.md`: su dung muc nay cho Foundation baseline va Day 3-4 external stub.
- `be-plan-phase-3-approval-mint-tax.md`: su dung muc nay cho dependencies/gate cua mint + tx logging.
- `be-plan-traceability-backlog.md`: map cac endpoint mint/event/provenance theo chain baseline moi.
