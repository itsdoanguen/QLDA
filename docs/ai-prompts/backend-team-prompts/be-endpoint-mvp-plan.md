## BE Plan Index

Day la file tong dong vai tro index cho bo plan backend. Moi phase da duoc tach thanh file rieng de review va giao viec ro rang hon.

Tai lieu doi chieu:
- [QLDA.txt](../../architecture/document/QLDA.txt)
- [project-specification.md](../../architecture/project-specification.md)
- [database-spec.md](../../architecture/database-spec.md)
- [Dự Án Blockchain Đô Thị - Product Backlog.csv](../../architecture/document/Dự%20Án%20Blockchain%20Đô%20Thị%20-%20Product%20Backlog.csv)

## Danh sach file plan

- [be-execution-ready-sprint-plan.md](be-execution-ready-sprint-plan.md)
- [be-taskboard-foundation-phase1.md](be-taskboard-foundation-phase1.md)
- [be-plan-vneid-sandbox.md](be-plan-vneid-sandbox.md)
- [be-plan-vneid-response-contracts.md](be-plan-vneid-response-contracts.md)
- [be-plan-blockchain-sepolia-quicknode.md](be-plan-blockchain-sepolia-quicknode.md)
- [be-plan-phase-1-auth-wallet.md](be-plan-phase-1-auth-wallet.md)
- [be-plan-phase-2-land-ipfs-cleansing.md](be-plan-phase-2-land-ipfs-cleansing.md)
- [be-plan-phase-3-approval-mint-tax.md](be-plan-phase-3-approval-mint-tax.md)
- [be-plan-phase-4-transactions-compliance-fraud.md](be-plan-phase-4-transactions-compliance-fraud.md)
- [be-plan-phase-5-hardening-release.md](be-plan-phase-5-hardening-release.md)
- [be-plan-traceability-backlog.md](be-plan-traceability-backlog.md)

## Cach su dung

1. Doc file index truoc de nam pham vi tong the.
2. Doc [be-execution-ready-sprint-plan.md](be-execution-ready-sprint-plan.md) va khoa het muc "Hard Foundation Patch" truoc khi code feature.
3. Doc tung phase file theo thu tu thuc thi.
4. Dung file traceability de map backlog -> endpoint -> test case.
5. Chi release khi phase truoc pass test gate.

## Entry Criteria (Ready to Code)

- package.json va turbo.json da co script install/build/test/dev.
- apps/api bootstrap duoc (main.ts + app.module.ts co noi dung va chay duoc).
- Shared DTO/contracts va VNeID sandbox contracts da ton tai trong packages/shared-types hoac file plan contract.
- Migration Phase 1 chay len/xuong thanh cong tren local DB.
- Mock VNeID sandbox + Redis session store + Pinata-backed IPFS adapter da san sang.
- NFR/Security/DevOps policy v0.1 da duoc review va chap thuan.

## Quick Readiness Checks (bat buoc pass)

1. `npm run build`
2. `npm run lint`
3. `npm run test`
4. `npm run db:migrate:up`
5. `npm run db:migrate:down`
6. Health check `GET /api/v1/health` = 200

## Decision

- Giu mo hinh phase-based implementation.
- Them Foundation Sprint de giai quyet blocker truoc khi vao Phase 1.
- Tach file de team BE co the phan cong theo sprint/phase.
- Chot file storage provider hien tai la Pinata thong qua IPFS abstraction de tranh vendor lock-in vao business logic.
- Chot boundary Ethereum Sepolia: Blockchain team phu trach contract/ABI/deploy (cho Sepolia testnet), BE team phu trach RPC Sepolia/tx lifecycle/event sync qua QuickNode.
- Cac hạng muc khong phuc vu truc tiep MVP core van de lai trong defer scope cua tung phase.
