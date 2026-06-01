# API (Backend) - LandContractQLDA

[Tiếng Việt](#tiếng-việt) | [日本語 (Japanese)](#日本語)

---

## Tiếng Việt

### Tổng quan
Đây là thành phần Backend API của hệ thống LandContractQLDA, được xây dựng bằng NestJS. API này cung cấp các endpoint để quản lý thông tin hợp đồng đất đai, người dùng và giao tiếp với Blockchain thông qua thư viện `ethers.js`.

### Yêu cầu
- Node.js
- PostgreSQL
- Môi trường Local Blockchain (Hardhat node) đang chạy.

### Hướng dẫn cài đặt
1. **Di chuyển vào thư mục api:**
   ```bash
   cd apps/api
   ```
2. **Cấu hình biến môi trường:**
   Tạo file `.env` dựa trên `.env.example` và điền các thông tin kết nối Database, Blockchain, và **IPFS (Pinata)**:
   ```bash
   cp .env.example .env
   ```
   *Lưu ý: Bạn cần tạo tài khoản trên Pinata (hoặc dịch vụ IPFS tương tự) để lấy API Key & Secret Key, sau đó điền vào file `.env` để tính năng lưu trữ phân tán hoạt động.*
3. **Chạy Migration Database:**
   ```bash
   npm run db:migrate:up
   ```
4. **Seed dữ liệu Admin (tuỳ chọn):**
   ```bash
   npm run seed:admin
   ```
5. **Khởi chạy API (môi trường Dev):**
   ```bash
   npm run dev
   ```

---

## 日本語

### 概要
これはLandContractQLDAシステムのバックエンドAPIコンポーネントであり、NestJSを使用して構築されています。このAPIは、土地契約情報、ユーザー情報を管理し、`ethers.js`ライブラリを介してブロックチェーンと通信するためのエンドポイントを提供します。

### 要件
- Node.js
- PostgreSQL
- ローカルブロックチェーン環境 (Hardhat node) が稼働していること。

### セットアップ手順
1. **apiディレクトリに移動：**
   ```bash
   cd apps/api
   ```
2. **環境変数の設定：**
   `.env.example`を元に`.env`ファイルを作成し、データベース、ブロックチェーン、および**IPFS (Pinata)**の接続情報を入力します：
   ```bash
   cp .env.example .env
   ```
   *注意：分散ストレージ機能を使用するには、Pinata（または類似のIPFSサービス）のアカウントを作成し、APIキーとシークレットキーを取得して`.env`ファイルに設定する必要があります。*
3. **データベースのマイグレーションの実行：**
   ```bash
   npm run db:migrate:up
   ```
4. **管理者データのシード (オプション)：**
   ```bash
   npm run seed:admin
   ```
5. **APIの起動 (開発環境)：**
   ```bash
   npm run dev
   ```
