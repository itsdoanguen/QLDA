// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MultiSigWorkflow
 * @dev Contract to manage multi-signature approval for land registration and dossiers.
 * Implement Task T08.1: Thiết kế cấu trúc dữ liệu Transaction và Signature.
 */
contract MultiSigWorkflow {
    
    // --- Enums ---

    enum SignerRole { 
        NONE, 
        CAN_BO,   // Cán bộ thụ lý
        LANH_DAO  // Lãnh đạo phê duyệt
    }

    enum TransactionStatus { 
        PENDING,  // Đang chờ duyệt
        APPROVED, // Đã đủ chữ ký
        REJECTED, // Đã bị từ chối
        EXECUTED  // Đã thực thi xong
    }

    // --- Structs ---

    struct Signature {
        address signer;
        SignerRole role;
        uint256 timestamp;
        bool isApproved;
        string reason; // Lý do từ chối (T08.10)
    }

    struct Transaction {
        uint256 transactionId;
        string documentCID;
        address creator;
        uint8 cbSignaturesCount;
        uint8 ldSignaturesCount;
        TransactionStatus status;
    }

    // --- State Variables ---

    uint256 public transactionCount;
    
    // Yêu cầu chữ ký mặc định theo tài liệu (2 CB, 1 LĐ)
    uint8 public constant REQUIRED_CB_SIGS = 2;
    uint8 public constant REQUIRED_LD_SIGS = 1;

    // transactionId => Transaction
    mapping(uint256 => Transaction) public transactions;
    
    // transactionId => signer address => Signature
    mapping(uint256 => mapping(address => Signature)) public transactionSignatures;
    
    // transactionId => list of signers (để dễ duyệt qua danh sách nếu cần)
    mapping(uint256 => address[]) public transactionSigners;

    // Quản lý Role của user (Mockup role management for testing)
    mapping(address => SignerRole) public userRoles;

    // --- Events ---
    event TransactionCreated(uint256 indexed transactionId, string documentCID, address indexed creator);
    event TransactionSigned(uint256 indexed transactionId, address indexed signer, SignerRole role, bool isApproved);
    event TransactionStatusChanged(uint256 indexed transactionId, TransactionStatus newStatus);

    // --- Admin Setup For Testing ---
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function setUserRole(address _user, SignerRole _role) external onlyAdmin {
        userRoles[_user] = _role;
    }

    // --- Core Functions (Basic implementations for structural verification) ---

    function createTransaction(string memory _documentCID) external returns (uint256) {
        transactionCount++;
        uint256 newTxId = transactionCount;

        transactions[newTxId] = Transaction({
            transactionId: newTxId,
            documentCID: _documentCID,
            creator: msg.sender,
            cbSignaturesCount: 0,
            ldSignaturesCount: 0,
            status: TransactionStatus.PENDING
        });

        emit TransactionCreated(newTxId, _documentCID, msg.sender);
        return newTxId;
    }

    function signTransaction(uint256 _txId, bool _isApproved, string memory _reason) external {
        Transaction storage txn = transactions[_txId];
        require(txn.transactionId != 0, "Transaction does not exist");
        require(txn.status == TransactionStatus.PENDING, "Transaction is not pending");
        
        // Kiểm tra người dùng chưa ký giao dịch này
        require(transactionSignatures[_txId][msg.sender].timestamp == 0, "Already signed");

        SignerRole role = userRoles[msg.sender];
        require(role == SignerRole.CAN_BO || role == SignerRole.LANH_DAO, "Unauthorized role");

        // Ghi nhận chữ ký
        transactionSignatures[_txId][msg.sender] = Signature({
            signer: msg.sender,
            role: role,
            timestamp: block.timestamp,
            isApproved: _isApproved,
            reason: _reason
        });
        
        transactionSigners[_txId].push(msg.sender);

        if (_isApproved) {
            if (role == SignerRole.CAN_BO) {
                txn.cbSignaturesCount++;
            } else if (role == SignerRole.LANH_DAO) {
                txn.ldSignaturesCount++;
            }
            
            // Check threshold
            if (txn.cbSignaturesCount >= REQUIRED_CB_SIGS && txn.ldSignaturesCount >= REQUIRED_LD_SIGS) {
                txn.status = TransactionStatus.APPROVED;
                emit TransactionStatusChanged(_txId, TransactionStatus.APPROVED);
            }
        } else {
            // Nếu có bất kỳ ai từ chối, chuyển trạng thái sang REJECTED
            txn.status = TransactionStatus.REJECTED;
            emit TransactionStatusChanged(_txId, TransactionStatus.REJECTED);
        }

        emit TransactionSigned(_txId, msg.sender, role, _isApproved);
    }
    
    // Function để get danh sách người ký của 1 transaction
    function getTransactionSigners(uint256 _txId) external view returns (address[] memory) {
        return transactionSigners[_txId];
    }
}
