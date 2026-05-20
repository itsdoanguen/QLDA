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
    event SignatureRevoked(uint256 indexed transactionId, address indexed signer);
    event TransactionRevertedToPending(uint256 indexed transactionId, address indexed by);

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
    
    event BatchSignError(uint256 indexed transactionId, string reason);

    /**
     * @dev Batch sign multiple transactions with local revert handling (Task T37.5 & T37.7).
     * If one transaction fails validation, it emits an error and continues with the next one.
     */
    function batchSignTransactions(
        uint256[] calldata _txIds,
        bool[] calldata _isApproved,
        string[] calldata _reasons
    ) external {
        require(_txIds.length == _isApproved.length && _txIds.length == _reasons.length, "Array lengths mismatch");

        SignerRole role = userRoles[msg.sender];
        require(role == SignerRole.CAN_BO || role == SignerRole.LANH_DAO, "Unauthorized role");

        for (uint256 i = 0; i < _txIds.length; i++) {
            uint256 txId = _txIds[i];
            Transaction storage txn = transactions[txId];

            // Local revert mechanism: check and continue instead of revert
            if (txn.transactionId == 0) {
                emit BatchSignError(txId, "Transaction does not exist");
                continue;
            }
            if (txn.status != TransactionStatus.PENDING) {
                emit BatchSignError(txId, "Transaction is not pending");
                continue;
            }
            if (transactionSignatures[txId][msg.sender].timestamp != 0) {
                emit BatchSignError(txId, "Already signed");
                continue;
            }

            // Ghi nhận chữ ký
            transactionSignatures[txId][msg.sender] = Signature({
                signer: msg.sender,
                role: role,
                timestamp: block.timestamp,
                isApproved: _isApproved[i],
                reason: _reasons[i]
            });
            
            transactionSigners[txId].push(msg.sender);

            if (_isApproved[i]) {
                if (role == SignerRole.CAN_BO) {
                    txn.cbSignaturesCount++;
                } else if (role == SignerRole.LANH_DAO) {
                    txn.ldSignaturesCount++;
                }
                
                // Check threshold
                if (txn.cbSignaturesCount >= REQUIRED_CB_SIGS && txn.ldSignaturesCount >= REQUIRED_LD_SIGS) {
                    txn.status = TransactionStatus.APPROVED;
                    emit TransactionStatusChanged(txId, TransactionStatus.APPROVED);
                }
            } else {
                txn.status = TransactionStatus.REJECTED;
                emit TransactionStatusChanged(txId, TransactionStatus.REJECTED);
            }

            emit TransactionSigned(txId, msg.sender, role, _isApproved[i]);
        }
    }

    /**
     * @dev Allow a signer to revoke their own signature before execution.
     * If transaction was REJECTED due to this or other signatures, revoking may set it back to PENDING.
     */
    function revokeMySignature(uint256 _txId) external {
        Transaction storage txn = transactions[_txId];
        require(txn.transactionId != 0, "Transaction does not exist");
        require(txn.status != TransactionStatus.EXECUTED, "Cannot revoke after execution");

        Signature storage sig = transactionSignatures[_txId][msg.sender];
        require(sig.timestamp != 0, "No signature to revoke");

        // Adjust counts
        if (sig.isApproved) {
            if (sig.role == SignerRole.CAN_BO && txn.cbSignaturesCount > 0) {
                txn.cbSignaturesCount--;
            } else if (sig.role == SignerRole.LANH_DAO && txn.ldSignaturesCount > 0) {
                txn.ldSignaturesCount--;
            }
        }

        // Remove signature
        delete transactionSignatures[_txId][msg.sender];
        emit SignatureRevoked(_txId, msg.sender);

        // If txn was REJECTED, try to move back to PENDING
        if (txn.status == TransactionStatus.REJECTED) {
            txn.status = TransactionStatus.PENDING;
            emit TransactionRevertedToPending(_txId, msg.sender);
        }
    }

    /**
     * @dev Admin function to revert a transaction to PENDING and clear all signatures.
     * This is used when a mistake is detected and the workflow must be reset.
     */
    function adminRevertTransaction(uint256 _txId) external onlyAdmin {
        Transaction storage txn = transactions[_txId];
        require(txn.transactionId != 0, "Transaction does not exist");
        require(txn.status != TransactionStatus.EXECUTED, "Cannot revert after execution");

        address[] storage signers = transactionSigners[_txId];
        for (uint256 i = 0; i < signers.length; i++) {
            address s = signers[i];
            Signature storage sig = transactionSignatures[_txId][s];
            if (sig.timestamp != 0) {
                // adjust counts
                if (sig.isApproved) {
                    if (sig.role == SignerRole.CAN_BO && txn.cbSignaturesCount > 0) {
                        txn.cbSignaturesCount--;
                    } else if (sig.role == SignerRole.LANH_DAO && txn.ldSignaturesCount > 0) {
                        txn.ldSignaturesCount--;
                    }
                }
                // delete signature record
                delete transactionSignatures[_txId][s];
            }
        }

        // clear signer list
        delete transactionSigners[_txId];

        // reset counts and status
        txn.cbSignaturesCount = 0;
        txn.ldSignaturesCount = 0;
        txn.status = TransactionStatus.PENDING;

        emit TransactionRevertedToPending(_txId, msg.sender);
    }

    // Function để get danh sách người ký của 1 transaction
    function getTransactionSigners(uint256 _txId) external view returns (address[] memory) {
        return transactionSigners[_txId];
    }
}
