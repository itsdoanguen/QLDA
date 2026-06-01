# Blockchain - LandContractQLDA

[Tiếng Việt](#tiếng-việt) | [日本語 (Japanese)](#日本語)

---

## Tiếng Việt

### Tổng quan
Thành phần này chứa các Smart Contract viết bằng Solidity và các script triển khai sử dụng framework Hardhat. Đây là nơi lưu trữ không thể thay đổi của các giao dịch hợp đồng đất đai.

### Yêu cầu
- Node.js

### Hướng dẫn cài đặt
1. **Di chuyển vào thư mục blockchain:**
   ```bash
   cd apps/blockchain
   ```
2. **Cấu hình biến môi trường:**
   Tạo file `.env` nếu cần thiết (dựa theo `.env.example` nếu có) để chứa thông tin private key hoặc RPC URL:
   ```bash
   # Cấu hình .env
   ```
3. **Khởi chạy Local Hardhat Node:**
   ```bash
   npm run node
   ```
   *Lưu ý: Giữ terminal này chạy để duy trì mạng blockchain nội bộ.*
4. **Biên dịch Smart Contract (mở một terminal khác):**
   ```bash
   npm run compile
   ```
5. **Triển khai Smart Contract:**
   ```bash
   npm run deploy
   ```
6. **(Tuỳ chọn) Chạy lệnh khởi tạo (tất cả trong một):**
   ```bash
   npm run all
   ```

---

## 日本語

### 概要
このコンポーネントには、Solidityで記述されたスマートコントラクトと、Hardhatフレームワークを使用したデプロイスクリプトが含まれています。ここは土地契約の取引の改ざん不可能な保存場所です。

### 要件
- Node.js

### セットアップ手順
1. **blockchainディレクトリに移動：**
   ```bash
   cd apps/blockchain
   ```
2. **環境変数の設定：**
   必要に応じて`.env`ファイルを作成し、プライベートキーやRPC URLの情報を入力します：
   ```bash
   # .envの設定
   ```
3. **ローカルHardhat Nodeの起動：**
   ```bash
   npm run node
   ```
   *注意: ローカルブロックチェーンネットワークを維持するため、このターミナルは開いたままにしてください。*
4. **スマートコントラクトのコンパイル (別のターミナルを開く)：**
   ```bash
   npm run compile
   ```
5. **スマートコントラクトのデプロイ：**
   ```bash
   npm run deploy
   ```
6. **(オプション) 初期化コマンドの実行 (オールインワン)：**
   ```bash
   npm run all
   ```
