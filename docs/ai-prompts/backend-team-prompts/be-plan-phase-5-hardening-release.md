## Phase 5 Plan: Hardening + Release Gate

### Goal
Stabilize the backend, validate the end-to-end flow, and prepare the system for release.

### Scope
Must have:
- Smoke tests for all core flows.
- Integration and E2E sanity checks.
- Basic performance checks.
- Audit coverage review.
- Swagger cleanup and endpoint documentation pass.

Out of scope:
- New features.
- Large dashboard/report expansions.

### Backlog Mapping
- Cross-cutting validation for all implemented EP/US/T items.

### API Contracts
- No new functional endpoints.
- Only stabilization and validation around existing routes.

### Required Rules
- All critical flows must pass at least one smoke test.
- Any high-severity backend bug blocks release.
- Documentation must match implemented routes.

### Tables Touched
- All tables used by earlier phases, read-only for validation.

### Test Gate
1. Full E2E: auth -> wallet -> land -> approval -> mint -> transaction -> verify.
2. Pre-check and QR verify response times are acceptable.
3. No critical RBAC bypass exists.
4. Blockchain logs and DB state are consistent for key flows.
5. Swagger matches the final route set.

### Dependencies
- All earlier phases complete.
- Test data seeded.
- Final blockchain contract addresses and ABI available.

### Notes
- Use this phase to close gaps only, not to expand scope.
- Keep release criteria strict.