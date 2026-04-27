## Team 1: Blockchain Core (Manager A + 5 Agents)
Nhiệm vụ: Xây dựng "Luật chơi" và lưu trữ dữ liệu gốc.

Cấu trúc thư mục: /packages/blockchain

Phân công cho 5 Agent:

Agent Architect: Viết Smart Contract chính (LandRegistry.sol: chứa hàm cấp sổ, chuyển nhượng).

Agent Security: Viết các Modifier kiểm tra quyền (chỉ Admin mới được cấp sổ, chỉ chủ đất mới được bán).

Agent NFT: Viết Smart Contract định danh lô đất dưới dạng NFT (ERC-721).

Agent Testing: Viết Unit Test (bằng Hardhat/Chai) để đảm bảo không có lỗi (Bug) mất tiền/mất đất.

Agent Deployment: Viết script deploy contract lên mạng vietcha.in và verify code trên Explorer.

## Team 2: Backend & System Integration (Manager B + 5 Agents)
Nhiệm vụ: Làm cầu nối giữa người dùng và Blockchain (vì người dân không biết dùng ví crypto trực tiếp, hoặc cần lưu các dữ liệu nặng như bản scan sổ đỏ, CMND).

Cấu trúc thư mục: /packages/backend

Phân công cho 5 Agent:

Agent Auth: Xây dựng chức năng đăng nhập, xác thực (JWT), quản lý Role (Cán bộ/Người dân).

Agent Listener: Viết job tự động "lắng nghe" sự kiện từ Blockchain (khi có giao dịch trên Explorer, tự động cập nhật về Database).

Agent IPFS: Xử lý việc upload ảnh sổ đỏ, giấy tờ lên IPFS (lưu trữ phi tập trung) rồi lấy mã Hash trả về cho Blockchain.

Agent API: Viết các API RESTful để Frontend gọi.

Agent Document: Viết Swagger (tài liệu API) để team Frontend biết đường gọi.

## Team 3: Frontend & Visualization (Manager C + 5 Agents)
Nhiệm vụ: Hiển thị giao diện quản lý đất đai trực quan.

Cấu trúc thư mục: /packages/frontend

Phân công cho 5 Agent:

Agent UI/UX: Code các component giao diện (Nút bấm, Form nhập liệu, Bảng danh sách).

Agent Web3: Xử lý việc kết nối ví (MetaMask), ký giao dịch (Sign Transaction) gửi lên vietcha.in.

Agent Map: Tích hợp bản đồ (Google Maps hoặc OpenStreetMap) để hiển thị vị trí lô đất.

Agent Dashboard: Vẽ biểu đồ thống kê (số lượng giao dịch, tổng số đất đã cấp).

Agent QA: Chuyên fix lỗi giao diện và responsive (mobile/desktop).