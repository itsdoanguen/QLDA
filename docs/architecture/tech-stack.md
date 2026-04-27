## Blockchain (Smart Contract):

Ngôn ngữ: Solidity (Bat buoc cho EVM cua Ethereum Sepolia).

Framework: Hardhat (Kết hợp TypeScript). Hardhat tốt hơn Truffle vì nó hỗ trợ TypeScript mạnh, giúp AI gợi ý code chính xác hơn.

Thư viện tương tác: Ethers.js v6.

Network cho dev/test: Ethereum Sepolia Testnet via QuickNode (bat buoc co file chua RPC URL va contract addresses theo moi environment, chainId `11155111`).

Ranh gioi trach nhiem:
- Blockchain team: design contract, test/deploy, cung cap ABI/address theo environment.
- BE team: tich hop RPC, goi ham contract, quan ly tx lifecycle, dong bo event on-chain vao DB.

## Backend (API & Off-chain Data):

Framework: NestJS (Node.js).

Database: PostgreSQL.

ORM/Migration: TypeORM + migration files (uu tien dong bo voi NestJS module pattern).

Session/Token control: Redis (blacklist/ttl cho logout va revoke).

API Contract: OpenAPI/Swagger + shared DTO package trong monorepo.

File storage gateway: IPFS client abstraction (provider hien tai: Pinata, co retry toi da 3 lan cho loi retryable).

Luu y tich hop chain:
- BE khong dung blockchain explorer lam data source nghiep vu.
- Explorer chi dung de troubleshoot/doi chieu tx hash.

Auth baseline: JWT access token + OTP flow cho thay doi thong tin lien he.

Wallet strategy (Phase 1):
- Model: Custodial Managed Wallet.
- Provisioning: Tu dong sau khi verify OTP thanh cong qua VNeID.
- Key management: private key duoc ma hoa AES-256-GCM va luu encrypted payload (khong luu plaintext).
- Network target: Ethereum Sepolia (`chainId 11155111`).
- Gasless scope: Chi dung o muc nen tang (env + service boundary), chua relay transaction trong phase nay.

## Frontend (Web App):

Framework: Next.js (React).

UI Library: Ant Design hoặc Tailwind CSS.

## Monorepo + Delivery Baseline (Implementation Ready)

- Monorepo orchestration: Turborepo (build/lint/test/dev pipeline).
- Package manager: npm workspaces (giu don gian cho sprint khoi dong).
- Quality gate toi thieu tren moi PR: lint + unit + integration smoke.
- CI yeu cau: backend phai build thanh cong truoc khi merge.