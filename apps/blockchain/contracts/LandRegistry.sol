// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LandNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LandRegistry
 * @dev Manages land parcel state machine and minting of Land NFTs (Task T12.1).
 *
 * State Machine (theo đặc tả project-specification.md):
 *
 *   [*] --> KHOI_TAO
 *   KHOI_TAO    --> CHO_DUYET      : Người dân nộp hồ sơ
 *   CHO_DUYET   --> DA_CAP_SO      : Lãnh đạo ký duyệt (Multi-sig)
 *   CHO_DUYET   --> TU_CHOI        : Hồ sơ sai lệch
 *   DA_CAP_SO   --> DANG_GIAO_DICH : Chủ đất tạo lệnh bán
 *   DANG_GIAO_DICH --> DA_CAP_SO   : Huỷ lệnh bán
 *   DANG_GIAO_DICH --> CHUYEN_NHUONG : Hoàn tất mua bán
 *   DA_CAP_SO   --> THE_CHAP       : Cầm cố ngân hàng
 *   THE_CHAP    --> DA_CAP_SO      : Giải chấp
 *   DA_CAP_SO   --> TRANH_CHAP     : Có đơn kiện
 *   TRANH_CHAP  --> DA_CAP_SO      : Giải quyết xong
 */
contract LandRegistry is Ownable, Pausable {
    LandNFT public landNFTContract;

    // --- Enums ---

    enum LandStatus {
        KHOI_TAO,       // Khởi tạo hồ sơ
        CHO_DUYET,      // Đang chờ phê duyệt Multi-sig
        DA_CAP_SO,      // Đã cấp sổ đỏ (trạng thái gốc ổn định)
        TU_CHOI,        // Hồ sơ bị từ chối
        DANG_GIAO_DICH, // Đang trong quá trình mua bán
        CHUYEN_NHUONG,  // Đã hoàn tất chuyển nhượng
        THE_CHAP,       // Đang thế chấp ngân hàng
        TRANH_CHAP      // Đang có tranh chấp pháp lý
    }

    // --- Structs ---

    struct LandData {
        uint256 tokenId;
        LandStatus status;
        string rejectReason; // Lý do từ chối (nếu có)
        uint256 createdAt;
        uint256 updatedAt;
    }

    // --- State Variables ---

    // tokenId => LandData
    mapping(uint256 => LandData) public lands;

    // --- Events ---

    event LandCreated(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event LandStatusChanged(uint256 indexed tokenId, LandStatus oldStatus, LandStatus newStatus);

    // --- Constructor ---

    constructor(address _landNFTAddress) {
        landNFTContract = LandNFT(_landNFTAddress);
    }

    // --- Internal Helpers ---

    function _requireRegistered(uint256 tokenId) internal view {
        require(lands[tokenId].tokenId != 0, "Land not registered");
    }

    function _transition(uint256 tokenId, LandStatus newStatus) internal {
        LandStatus old = lands[tokenId].status;
        lands[tokenId].status = newStatus;
        lands[tokenId].updatedAt = block.timestamp;
        emit LandStatusChanged(tokenId, old, newStatus);
    }

    // --- Admin Emergency Pause (Task T46.5) ---

    /**
     * @dev Emergency stop for all state transitions
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Core Functions ---

    /**
     * @dev Mints an NFT and initialises land record at KHOI_TAO state.
     */
    function createLandRecord(address to, string memory tokenURI) external onlyOwner whenNotPaused returns (uint256) {
        uint256 tokenId = landNFTContract.mintLandNFT(to, tokenURI);

        lands[tokenId] = LandData({
            tokenId: tokenId,
            status: LandStatus.KHOI_TAO,
            rejectReason: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit LandCreated(tokenId, to, tokenURI);
        return tokenId;
    }

    // --- State Transition Functions ---

    /**
     * @dev KHOI_TAO → CHO_DUYET: Người dân nộp hồ sơ chính thức.
     */
    function submitForApproval(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.KHOI_TAO, "Must be in KHOI_TAO state");
        _transition(tokenId, LandStatus.CHO_DUYET);
    }

    /**
     * @dev CHO_DUYET → DA_CAP_SO: Lãnh đạo ký duyệt (đủ chữ ký Multi-sig).
     */
    function approveLand(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.CHO_DUYET, "Must be in CHO_DUYET state");
        _transition(tokenId, LandStatus.DA_CAP_SO);
    }

    /**
     * @dev CHO_DUYET → TU_CHOI: Hồ sơ bị từ chối.
     */
    function rejectLand(uint256 tokenId, string calldata reason) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.CHO_DUYET, "Must be in CHO_DUYET state");
        lands[tokenId].rejectReason = reason;
        _transition(tokenId, LandStatus.TU_CHOI);
    }

    /**
     * @dev DA_CAP_SO → DANG_GIAO_DICH: Chủ đất tạo lệnh bán.
     */
    function startTransaction(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.DA_CAP_SO, "Must be in DA_CAP_SO state");
        _transition(tokenId, LandStatus.DANG_GIAO_DICH);
    }

    /**
     * @dev DANG_GIAO_DICH → DA_CAP_SO: Huỷ lệnh bán.
     */
    function cancelTransaction(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.DANG_GIAO_DICH, "Must be in DANG_GIAO_DICH state");
        _transition(tokenId, LandStatus.DA_CAP_SO);
    }

    /**
     * @dev DANG_GIAO_DICH → CHUYEN_NHUONG: Hoàn tất mua bán.
     */
    function completeTransfer(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.DANG_GIAO_DICH, "Must be in DANG_GIAO_DICH state");
        _transition(tokenId, LandStatus.CHUYEN_NHUONG);
    }

    /**
     * @dev DA_CAP_SO → THE_CHAP: Cầm cố ngân hàng.
     */
    function mortgage(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.DA_CAP_SO, "Must be in DA_CAP_SO state");
        _transition(tokenId, LandStatus.THE_CHAP);
    }

    /**
     * @dev THE_CHAP → DA_CAP_SO: Giải chấp.
     */
    function releaseMortgage(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.THE_CHAP, "Must be in THE_CHAP state");
        _transition(tokenId, LandStatus.DA_CAP_SO);
    }

    /**
     * @dev DA_CAP_SO → TRANH_CHAP: Có đơn kiện.
     */
    function raiseDispute(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.DA_CAP_SO, "Must be in DA_CAP_SO state");
        _transition(tokenId, LandStatus.TRANH_CHAP);
    }

    /**
     * @dev TRANH_CHAP → DA_CAP_SO: Giải quyết xong.
     */
    function resolveDispute(uint256 tokenId) external onlyOwner whenNotPaused {
        _requireRegistered(tokenId);
        require(lands[tokenId].status == LandStatus.TRANH_CHAP, "Must be in TRANH_CHAP state");
        _transition(tokenId, LandStatus.DA_CAP_SO);
    }

    // --- Query / Pre-check Functions ---

    /**
     * @dev Returns the current status of a land parcel.
     */
    function getLandStatus(uint256 tokenId) external view returns (LandStatus) {
        _requireRegistered(tokenId);
        return lands[tokenId].status;
    }

    /**
     * @dev Automated pre-check: returns true only if the land is in DA_CAP_SO state (safe to transact).
     */
    function canTransact(uint256 tokenId) external view returns (bool) {
        _requireRegistered(tokenId);
        return lands[tokenId].status == LandStatus.DA_CAP_SO;
    }

    /**
     * @dev Returns true if land is currently disputed or mortgaged (blocked states).
     */
    function isBlocked(uint256 tokenId) external view returns (bool) {
        _requireRegistered(tokenId);
        LandStatus s = lands[tokenId].status;
        return (s == LandStatus.TRANH_CHAP || s == LandStatus.THE_CHAP);
    }
}

