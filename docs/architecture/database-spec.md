// ==========================================
// 1. PHÂN QUYỀN VÀ NGƯỜI DÙNG
// ==========================================
Table Roles {
  id int [pk, increment]
  role_code varchar [note: 'ND, CB, LĐ, CS, AD']
  role_name varchar
  description text
}

Table Users {
  id int [pk, increment]
  role_id int [ref: > Roles.id]
  vneid_number varchar [unique, note: 'Số CCCD định danh qua VNeID']
  full_name varchar
  email varchar
  phone varchar
  status varchar [note: 'Active, Inactive']
  created_at timestamp
}

Table Auth_Identities {
  id int [pk, increment]
  user_id int [ref: - Users.id]
  provider varchar [note: 'vneid']
  provider_id varchar [note: 'Số CCCD']
  auth_level varchar [note: 'loa1, loa2']
  last_verified_at timestamp
  created_at timestamp
}

Table User_Sessions {
  id varchar [pk, note: 'Session Token / JTI']
  user_id int [ref: > Users.id]
  provider_session_id varchar [note: 'JTI từ VNeID Sandbox']
  ip_address varchar
  user_agent varchar
  expires_at timestamp
  created_at timestamp
}

// ==========================================
// 2. QUẢN LÝ VÍ VÀ LIÊN KẾT ĐỊNH DANH
// ==========================================
Table Wallets {
  wallet_address varchar [pk, note: 'Địa chỉ ví MetaMask']
  user_id int [ref: - Users.id, unique, note: 'Mapping 1-1 với VNeID']
  status varchar [note: 'Active, Locked, Replaced']
  created_at timestamp
}

Table Wallet_Recovery_Requests {
  id int [pk, increment]
  user_id int [ref: > Users.id]
  old_wallet_address varchar
  new_wallet_address varchar
  status varchar [note: 'Pending, Approved, Rejected']
  approved_by int [ref: > Users.id, note: 'Lãnh đạo phê duyệt']
  created_at timestamp
  resolved_at timestamp
}

// ==========================================
// 3. QUẢN LÝ HỒ SƠ ĐẤT ĐAI, LƯU NHÁP & VERSIONING
// ==========================================
Table Land_Records {
  id int [pk, increment]
  owner_id int [ref: > Users.id, note: 'Người dân tạo hồ sơ']
  address text
  area decimal
  gps_coordinates text [note: 'Tọa độ / Polygon hiện hành']
  is_frozen boolean [default: false, note: 'Đánh dấu Data Freeze, cấm sửa đổi']
  status varchar [note: 'Draft, Chờ đối soát, Cần bổ sung, Đã đối soát, Đã Mint']
  created_at timestamp
  updated_at timestamp
}

Table Land_Record_Versions {
  id int [pk, increment]
  record_id int [ref: > Land_Records.id]
  editor_id int [ref: > Users.id, note: 'Cán bộ thực hiện đối soát/chỉnh sửa']
  old_area decimal
  new_area decimal
  old_gps_coordinates text
  new_gps_coordinates text
  edit_reason text
  version_number int
  created_at timestamp [note: 'Thời điểm thực hiện chỉnh sửa']
}

Table Land_Files {
  id int [pk, increment]
  record_id int [ref: > Land_Records.id]
  file_name varchar
  file_type varchar [note: 'JPG, PDF, PNG']
  ipfs_cid varchar [unique, note: 'Mã CID lưu trữ trên IPFS']
  uploaded_by int [ref: > Users.id]
  created_at timestamp
}

// ==========================================
// 4. TÀI SẢN SỐ & SMART CONTRACT
// ==========================================
Table Smart_Contracts {
  contract_address varchar [pk, note: 'Dia chi contract deploy tren Ethereum Sepolia']
  name varchar [note: 'Core, NFT (ERC-721/1155), Multi-sig, Transaction']
  abi text
  version varchar
  status varchar [note: 'Active, Paused']
  deployed_at timestamp
}

Table Land_NFTs {
  token_id varchar [pk]
  record_id int [ref: - Land_Records.id, unique]
  contract_address varchar [ref: > Smart_Contracts.contract_address]
  owner_wallet varchar [ref: > Wallets.wallet_address]
  metadata_uri varchar [note: 'Link chứa CID trên IPFS']
  qr_code varchar [unique, note: 'Mã QR sinh tự động']
  mint_tx_hash varchar [ref: - Blockchain_Logs.tx_hash]
  status varchar [note: 'Normal, Trading, Locked']
  mint_date timestamp
}

// ==========================================
// 5. CACHE LỊCH SỬ BIẾN ĐỘNG (PROVENANCE)
// ==========================================
Table Cached_Provenance_Logs {
  id int [pk, increment]
  token_id varchar [ref: > Land_NFTs.token_id, note: 'Để Cảnh sát tra cứu offline qua QR']
  event_type varchar [note: 'Transfer, Area_Change, Dispute_Resolved']
  event_data text [note: 'JSON chứa chi tiết event từ Blockchain']
  tx_hash varchar [ref: > Blockchain_Logs.tx_hash]
  block_number int
  cached_at timestamp [note: 'Thời điểm đồng bộ về Local Database']
}

// ==========================================
// 6. QUY TRÌNH ĐA CHỮ KÝ (MULTI-SIGNATURE)
// ==========================================
Table Approval_Requests {
  id int [pk, increment]
  record_id int [ref: > Land_Records.id]
  request_type varchar [note: 'Mint_NFT, Recover_Wallet']
  status varchar [note: 'Pending, Approved, Rejected, Reverted']
  created_at timestamp
}

Table Signatures {
  id int [pk, increment]
  request_id int [ref: > Approval_Requests.id]
  user_id int [ref: > Users.id]
  decision varchar [note: 'Approved, Rejected']
  reason text
  sign_tx_hash varchar
  signed_at timestamp
}

// ==========================================
// 7. GIAO DỊCH, THUẾ VÀ THANH TOÁN
// ==========================================
Table Transactions {
  id int [pk, increment]
  token_id varchar [ref: > Land_NFTs.token_id]
  seller_id int [ref: > Users.id]
  buyer_id int [ref: > Users.id]
  certifier_id int [ref: > Users.id, note: 'Cán bộ chứng thực']
  contract_price decimal
  status varchar [note: 'Pre-check, Draft, Signed, Completed, Cancelled']
  created_at timestamp
  completed_at timestamp
}

Table Taxes_Fees {
  id int [pk, increment]
  transaction_id int [ref: > Transactions.id]
  tax_type varchar [note: 'TNCN (2%), Lệ phí trước bạ']
  amount decimal
  status varchar [note: 'Unpaid, Paid']
  calculated_at timestamp
}

Table Receipts {
  id int [pk, increment]
  tax_id int [ref: - Taxes_Fees.id]
  payment_method varchar
  blockchain_tx_hash varchar
  paid_at timestamp
}

// ==========================================
// 8. QUY HOẠCH, TRANH CHẤP & THẾ CHẤP (PRE-CHECK)
// ==========================================
Table Planning_Zones {
  id int [pk, increment]
  zone_name varchar
  description text
  polygon_coordinates text
  status varchar
  updated_at timestamp
}

Table Land_Planning_Map {
  record_id int [ref: > Land_Records.id]
  zone_id int [ref: > Planning_Zones.id]
  status varchar [note: 'Safe, Warning, Danger']
  primary key (record_id, zone_id)
}

Table Disputes {
  id int [pk, increment]
  token_id varchar [ref: > Land_NFTs.token_id]
  claimant_id int [ref: > Users.id]
  description text
  status varchar [note: 'Pending, Resolving, Resolved']
  created_at timestamp
  resolved_at timestamp
}

Table Mortgages {
  id int [pk, increment]
  token_id varchar [ref: > Land_NFTs.token_id]
  bank_name varchar
  mortgage_amount decimal
  status varchar [note: 'Active, Released']
  created_at timestamp
  released_at timestamp
}

Table Fraud_Reports {
  id int [pk, increment]
  reporter_id int [ref: > Users.id, note: 'Cảnh sát báo cáo gian lận tại thực địa']
  token_id varchar [ref: > Land_NFTs.token_id]
  reason text
  evidence_images text [note: 'Link ảnh bằng chứng']
  status varchar [note: 'Pending, Verified, Rejected']
  reviewed_by int [ref: > Users.id]
  created_at timestamp
}

// ==========================================
// 9. CẤU HÌNH HỆ THỐNG VÀ AUDIT TRAIL
// ==========================================
Table System_Configs {
  config_key varchar [pk, note: 'Ví dụ: TAX_RATE_TNCN, TAX_RATE_TRUCBA']
  config_value varchar
  description text
  updated_at timestamp
}

Table System_Config_Audits {
  id int [pk, increment]
  config_key varchar [ref: > System_Configs.config_key]
  editor_id int [ref: > Users.id, note: 'Quản trị viên thực hiện thay đổi']
  old_value varchar
  new_value varchar
  changed_at timestamp [note: 'Hiển thị trên Timeline/Audit View']
}

// ==========================================
// 10. THÔNG BÁO VÀ NHẬT KÝ
// ==========================================
Table Notifications {
  id int [pk, increment]
  user_id int [ref: > Users.id]
  title varchar
  content text
  type varchar [note: 'Warning, Info, System, SLA_Alert']
  is_read boolean
  created_at timestamp
}

Table System_Logs {
  id int [pk, increment]
  user_id int [ref: > Users.id]
  action varchar [note: 'Xem, Sửa, Duyệt, v.v.']
  target_table varchar
  target_id varchar
  hash_value varchar [note: 'Băm SHA-256 chống sửa log']
  ip_address varchar
  created_at timestamp
}

Table Blockchain_Logs {
  tx_hash varchar [pk]
  action_type varchar [note: 'Mint_NFT, Transfer, Multi-sig, etc.']
  gas_fee decimal
  status varchar [note: 'Success, Reverted, Out_Of_Gas']
  timestamp timestamp
}