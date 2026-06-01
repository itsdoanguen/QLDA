# Web (Frontend) - LandContractQLDA

[Tiếng Việt](#tiếng-việt) | [日本語 (Japanese)](#日本語)

---

## Tiếng Việt

### Tổng quan
Giao diện người dùng Web của hệ thống LandContractQLDA, được xây dựng bằng Next.js, React, và Ant Design. Ứng dụng này cung cấp trải nghiệm trực quan để người dùng và quản trị viên có thể tương tác với hệ thống quản lý đất đai và xem các bản đồ thửa đất.

### Yêu cầu
- Node.js
- API Backend (đang chạy)
- **Ví Blockchain (Ví dụ: MetaMask)** đã được cài đặt trên trình duyệt (extension).

### Hướng dẫn cài đặt
1. **Di chuyển vào thư mục web:**
   ```bash
   cd apps/web
   ```
2. **Cấu hình biến môi trường:**
   Tạo file `.env.local` hoặc `.env` để cấu hình URL trỏ tới API Backend và Blockchain provider:
   ```bash
   # URL mặc định của API là http://localhost:3000 (tuỳ cấu hình Backend)
   ```
3. **Khởi chạy ứng dụng Web (môi trường Dev):**
   ```bash
   npm run dev
   ```
4. Truy cập giao diện tại: `http://localhost:4060` (hoặc port được chỉ định trong script dev).
5. **Kết nối ví:** Đảm bảo ví MetaMask của bạn đang trỏ tới mạng lưới Blockchain nội bộ (Hardhat network) với RPC URL phù hợp (thường là `http://127.0.0.1:8545`) và import một tài khoản test có sẵn ETH.

---

## 日本語

### 概要
Next.js、React、およびAnt Designを使用して構築されたLandContractQLDAシステムのWebユーザーインターフェースです。このアプリケーションは、ユーザーや管理者が土地管理システムと対話し、区画の地図を表示するための直感的な体験を提供します。

### 要件
- Node.js
- バックエンドAPI (稼働中であること)
- ブラウザ拡張機能として**ブロックチェーンウォレット（例：MetaMask）**がインストールされていること。

### セットアップ手順
1. **webディレクトリに移動：**
   ```bash
   cd apps/web
   ```
2. **環境変数の設定：**
   バックエンドAPIやブロックチェーンプロバイダーのURLを設定するために、`.env.local`または`.env`ファイルを作成します：
   ```bash
   # APIのデフォルトURLは http://localhost:3000 です（バックエンドの設定による）
   ```
3. **Webアプリケーションの起動 (開発環境)：**
   ```bash
   npm run dev
   ```
4. ブラウザでアクセスします： `http://localhost:4060` (またはdevスクリプトで指定されたポート)。
5. **ウォレットの接続:** MetaMaskウォレットが適切なRPC URL（通常は `http://127.0.0.1:8545`）でローカルブロックチェーンネットワーク（Hardhat network）を指していることを確認し、テスト用のETHを持つアカウントをインポートしてください。
