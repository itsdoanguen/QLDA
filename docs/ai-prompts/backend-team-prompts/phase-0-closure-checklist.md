## Phase 0 Closure Checklist

Use this checklist to close the server base before starting Phase 1.

### 1. Contract baseline

- [ ] Chot mot contract duy nhat cho IPFS / Pinata.
- [ ] Dong bo contract do trong `.env.example`.
- [ ] Dong bo contract do trong `apps/api/src/config/env/env.schema.ts`.
- [ ] Dong bo contract do trong `apps/api/src/modules/ipfs/*`.
- [ ] Dam bao ten bien env, implementation, va tai lieu khong bi drift.

### 2. Blockchain boundary baseline

- [ ] Tao blockchain boundary skeleton cho BE trong `apps/api/src/modules`.
- [ ] Co provider cho RPC / signer.
- [ ] Co ABI loader.
- [ ] Co tx lifecycle handler: submit, pending, confirmed, failed.
- [ ] Co event / indexer hook de dong bo on-chain -> off-chain.
- [ ] Co ghi ro Sepolia / QuickNode trong implementation hoac tai lieu.

### 3. NFR / Security / DevOps v0.1

- [ ] Co tai lieu SLO tam thoi cho auth / profile.
- [ ] Co JWT access / refresh policy.
- [ ] Co secret rotation policy.
- [ ] Co rollback playbook ban 1.
- [ ] Co monitoring baseline: app up/down, error rate, latency.
- [ ] Team da review va sign-off policy v0.1.

### 4. CI / smoke gates

- [ ] Co workflow CI hoac pipeline tuong duong trong repo.
- [ ] CI chay `npm run build`.
- [ ] CI chay `npm run lint`.
- [ ] CI chay `npm run test`.
- [ ] CI chay `npm run db:migrate:up`.
- [ ] CI chay `npm run db:migrate:down`.
- [ ] CI smoke check `GET /api/v1/health`.

### 5. TypeScript baseline cleanup

- [ ] Xu ly warning / deprecation trong `apps/api/tsconfig.json`.
- [ ] Dam bao compile cua API app on dinh tren TypeScript hien tai.

### 6. Evidence gate

- [ ] Co bang chung command output cho cac gate tren.
- [ ] Co link PR hoac note nhan xet cho tung gate.
- [ ] Khong con foundation blocker trong taskboard.

### 7. Phase 0 done rule

- [ ] Chi danh dau Phase 0 done khi tat ca muc tren da PASS.
- [ ] Neu con bat ky muc nao FAIL, chua vao Phase 1.



####
Lock the external contract for IPFS/Pinata.
The current code uses env.schema.ts:17 and .env.example:23 with IPFS_API_URL / IPFS_API_KEY, while the sprint plan expects Pinata-specific variables like PINATA_JWT, PINATA_API_BASE, and PINATA_GATEWAY_BASE in be-execution-ready-sprint-plan.md:56. Pick one contract and make docs, schema, and implementation consistent.

Add the missing blockchain boundary skeleton on the BE side.
Phase 0 explicitly calls for provider/signer/ABI loader, tx lifecycle handling, and event sync hooks, but there is no blockchain module under modules. This is still a foundation gap, not a Phase 1 feature.

Finish the NFR / Security / DevOps v0.1 docs.
The taskboard still shows this as TODO in be-taskboard-foundation-phase1.md:21, and the review checkpoint is still open in be-taskboard-foundation-phase1.md:104. At minimum, write down SLO, JWT/refresh policy, secret rotation, rollback, and monitoring baseline.

Add CI smoke coverage for the foundation gates.
Right now there is no visible workflow in .github/workflows, so the plan’s smoke-check requirement is not actually enforced. Phase 0 should not be considered complete until build, lint, test, migrations, and health are exercised in CI or an equivalent pipeline.

Clean up the TypeScript baseline warning in the API app.
The API tsconfig still shows deprecation/compatibility issues in tsconfig.json:11, tsconfig.json:12, and tsconfig.json:16. That is not a Phase 1 blocker by itself, but it is part of finishing a stable server base.

Re-run the phase-0 gate after those changes.
The practical completion check is still the same set from be-execution-ready-sprint-plan.md:75: build, lint, test, migrations up/down, and GET /api/v1/health.