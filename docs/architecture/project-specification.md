# ĐẶC TẢ YÊU CẦU DỰ ÁN: HỆ THỐNG QUẢN LÝ HỒ SƠ ĐẤT ĐAI TRÊN BLOCKCHAIN

**Phiên bản:** 1.0.0
**Ngày lập:** 06/02/2026
**Nen tang Blockchain:** Ethereum Sepolia (Testnet) via QuickNode
**Mô hình phát triển:** Human-AI Collaboration (3 Quản lý - 15 AI Agents)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Xây dựng hệ thống quản lý vòng đời hồ sơ đất đai (Land Registry) minh bạch, bất biến và liên thông giữa các cơ quan nhà nước và người dân. Hệ thống sử dụng công nghệ Blockchain để giải quyết các vấn đề: giả mạo sổ đỏ, quy trình hành chính rườm rà, và thiếu minh bạch trong tra cứu quy hoạch.

---

## 2. NGHIỆP VỤ CỐT LÕI (CORE BUSINESS LOGIC)

### 2.1. Định danh & Quản lý Truy cập (Identity & Access)
* **Tích hợp API Quốc gia (KYC):** Kết nối giả lập với CSDL Dân cư Quốc gia.
* **Nguyên tắc 1-1:** Mỗi công dân (số CCCD) chỉ được liên kết với một địa chỉ ví Blockchain duy nhất.
* **Phân quyền (RBAC):** Hệ thống phân chia quyền rõ rệt:
    * *Người dân:* Chỉ xem tài sản của mình và thực hiện giao dịch.
    * *Cán bộ TNMT:* Có quyền nhập liệu, xác thực.
    * *Lãnh đạo Sở:* Có quyền phê duyệt cuối cùng (Ký số).

### 2.2. Số hóa & Ghi danh Tài sản (Asset Digitization)
* **Digital Twin (Bản sao số):** Mỗi thửa đất thực tế tương ứng với một Token (NFT - ERC721) trên Blockchain.
* **Lưu trữ Off-chain (IPFS):**
    * Các dữ liệu nặng (ảnh scan sổ đỏ, bản đồ địa chính, CMND) được lưu trên mạng **IPFS**.
    * Chỉ lưu mã băm (**CID**) của file lên Smart Contract để tối ưu chi phí Gas.
* **Quy trình Hậu kiểm (Data Cleansing):** Trước khi Mint (tạo) Token, dữ liệu phải qua bước làm sạch và đối chiếu với hồ sơ giấy để đảm bảo tính chính xác tuyệt đối.

### 2.3. Quy trình Phê duyệt Liên thông
* **Cơ chế State Machine:** Smart Contract quản lý trạng thái hồ sơ. Khi Sở A duyệt, trạng thái tự động chuyển sang Sở B.
* **Chống đi "cửa sau":** Không thể bỏ qua các bước trong quy trình đã được lập trình cứng (Hard-coded).

### 2.4. Giao dịch & Chuyển nhượng
* **Tự động kiểm tra (Automated Pre-checks):** Smart Contract tự động chặn giao dịch nếu:
    * Đất đang có tranh chấp.
    * Đất đang thế chấp ngân hàng.
    * Đất nằm trong vùng quy hoạch "treo".
* **Hợp đồng Mua bán Điện tử:** Yêu cầu chữ ký số của Bên Bán, Bên Mua và Cán bộ công chứng.
* **Tính thuế tự động:** Tự động tính thuế TNCN và Lệ phí trước bạ, tích hợp cổng thanh toán.

### 2.5. Quản trị & Kiểm soát (Administrative)
* **Đa chữ ký (Multi-signature Approval):** Một hồ sơ sang tên cần tối thiểu:
    * 2 Chữ ký của Cán bộ thụ lý.
    * 1 Chữ ký của Lãnh đạo.
* **Giấy phép điện tử (QR Code):** Cấp QR code cho mỗi sổ đỏ, cho phép quét để xác thực thật/giả tức thì qua Blockchain Explorer.

---

## 3. QUY TRÌNH HỆ THỐNG (SYSTEM WORKFLOWS)

### 3.1. Luồng cấp mới sổ đỏ (Sequence Diagram)

```mermaid
sequenceDiagram
    participant User as Người dân
    participant FE as Web App
    participant BE as Backend (NestJS)
    participant IPFS as IPFS Storage
    participant SC as Smart Contract (Ethereum Sepolia)

    User->>FE: Nộp hồ sơ (Ảnh scan + Thông tin)
    FE->>BE: Gửi dữ liệu
    BE->>IPFS: Upload ảnh Scan sổ đỏ
    IPFS-->>BE: Trả về mã CID (QmHash...)
    BE->>BE: Lưu tạm vào DB (Trạng thái: PENDING)
    
    Note over BE: Cán bộ thực hiện xác minh & Hậu kiểm
    
    BE->>SC: Gọi hàm mintLand(Address, CID, MetaData)
    SC->>SC: Kiểm tra quyền Admin
    SC-->>BE: Trả về TokenID & Transaction Hash
    BE->>FE: Cập nhật trạng thái: ĐÃ CẤP SỔ

stateDiagram-v2
    [*] --> KHOI_TAO
    KHOI_TAO --> CHO_DUYET: Người dân nộp hồ sơ
    CHO_DUYET --> DA_CAP_SO: Lãnh đạo ký duyệt (Multi-sig)
    CHO_DUYET --> TU_CHOI: Hồ sơ sai lệch
    
    DA_CAP_SO --> DANG_GIAO_DICH: Chủ đất tạo lệnh bán
    DANG_GIAO_DICH --> DA_CAP_SO: Hủy lệnh bán
    DANG_GIAO_DICH --> CHUYEN_NHUONG: Hoàn tất mua bán
    
    DA_CAP_SO --> THE_CHAP: Cầm cố ngân hàng
    THE_CHAP --> DA_CAP_SO: Giải chấp
    
    DA_CAP_SO --> TRANH_CHAP: Có đơn kiện
    TRANH_CHAP --> DA_CAP_SO: Giải quyết xong