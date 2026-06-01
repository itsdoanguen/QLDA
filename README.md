# LandContractQLDA

[Tiếng Việt](#tiếng-việt) | [日本語 (Japanese)](#日本語)

---

## Tiếng Việt

### Tổng quan dự án
LandContractQLDA là một hệ thống quản lý hợp đồng đất đai ứng dụng công nghệ Blockchain, giúp đảm bảo tính minh bạch, an toàn và toàn vẹn dữ liệu trong các giao dịch bất động sản và quản lý quyền sử dụng đất. Dự án cung cấp một giải pháp toàn diện bao gồm giao diện Web cho người dùng, API Backend để xử lý nghiệp vụ và Smart Contract trên Blockchain để lưu trữ thông tin không thể thay đổi.

### Công nghệ sử dụng
- **Web (Frontend)**: Next.js, React, Ant Design, Zustand, Tailwind CSS, React Leaflet.
- **API (Backend)**: NestJS, TypeORM, PostgreSQL, Ethers.js.
- **Blockchain**: Hardhat, Solidity, OpenZeppelin, Ethers.js.
- **Quản lý Monorepo**: Turborepo, npm workspaces.

### Cấu trúc thư mục
Dự án được tổ chức dưới dạng Monorepo sử dụng Turborepo:
```text
LandContractQLDA/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── blockchain/   # Hardhat & Smart Contracts
│   └── web/          # Next.js Frontend Web
├── packages/
│   └── shared-types/ # Các type dùng chung cho cả project
├── docs/             # Tài liệu dự án
└── package.json      # Cấu hình workspace gốc
```

### Hướng dẫn cài đặt tổng quan
1. Yêu cầu hệ thống:
   - Node.js (phiên bản phù hợp, vd: v18+)
   - PostgreSQL
   - npm
2. Cài đặt các dependencies tại thư mục gốc:
   ```bash
   npm install
   ```
3. Xem hướng dẫn chi tiết cài đặt và khởi chạy cho từng thành phần tại các thư mục tương ứng:
   - [Hướng dẫn setup API (Backend)](./apps/api/README.md)
   - [Hướng dẫn setup Blockchain](./apps/blockchain/README.md)
   - [Hướng dẫn setup Web (Frontend)](./apps/web/README.md)

---

## 日本語

### プロジェクト概要
LandContractQLDAは、ブロックチェーン技術を応用した土地契約管理システムであり、不動産取引や土地利用権管理における透明性、安全性、データ整合性を確保します。このプロジェクトは、ユーザー向けのWebインターフェース、ビジネスロジックを処理するバックエンドAPI、そして改ざん不可能な情報を保存するブロックチェーン上のスマートコントラクトを含む包括的なソリューションを提供します。

### 使用技術
- **Web (フロントエンド)**: Next.js, React, Ant Design, Zustand, Tailwind CSS, React Leaflet.
- **API (バックエンド)**: NestJS, TypeORM, PostgreSQL, Ethers.js.
- **ブロックチェーン**: Hardhat, Solidity, OpenZeppelin, Ethers.js.
- **モノレポ管理**: Turborepo, npm workspaces.

### ディレクトリ構成
プロジェクトはTurborepoを使用したモノレポ構成で管理されています：
```text
LandContractQLDA/
├── apps/
│   ├── api/          # NestJS バックエンドAPI
│   ├── blockchain/   # Hardhat & スマートコントラクト
│   └── web/          # Next.js フロントエンドWeb
├── packages/
│   └── shared-types/ # プロジェクト全体で共有される型定義
├── docs/             # プロジェクトドキュメント
└── package.json      # ルートワークスペース設定
```

### インストール手順の概要
1. システム要件：
   - Node.js (推奨バージョン、例: v18+)
   - PostgreSQL
   - npm
2. ルートディレクトリで依存関係をインストール：
   ```bash
   npm install
   ```
3. 各コンポーネントの詳細なセットアップおよび起動手順については、対応するディレクトリのREADMEを参照してください：
   - [API (バックエンド) セットアップガイド](./apps/api/README.md)
   - [ブロックチェーン セットアップガイド](./apps/blockchain/README.md)
   - [Web (フロントエンド) セットアップガイド](./apps/web/README.md)
