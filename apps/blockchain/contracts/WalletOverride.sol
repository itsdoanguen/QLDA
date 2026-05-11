// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LandNFT.sol";

/**
 * @title WalletOverride
 * @dev Manages wallet recovery/override requests for land NFTs (Task T15.2).
 *
 * Nghiệp vụ:
 * - Một user (định danh bằng CCCD hash) chỉ được liên kết với 1 ví tại 1 thời điểm.
 * - Khi mất ví, cần Lãnh đạo (Admin) phê duyệt yêu cầu khôi phục trước khi ví cũ bị ghi đè.
 * - Sau khi phê duyệt, tất cả NFT trên ví cũ sẽ được transfer sang ví mới.
 */
contract WalletOverride is Ownable {
    LandNFT public landNFTContract;

    enum RecoveryStatus { PENDING, APPROVED, REJECTED }

    struct RecoveryRequest {
        uint256 requestId;
        bytes32 citizenIdHash;   // SHA-256 hash của Số CCCD, bảo mật thông tin định danh
        address oldWallet;
        address newWallet;
        RecoveryStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    uint256 public requestCount;

    // requestId => RecoveryRequest
    mapping(uint256 => RecoveryRequest) public recoveryRequests;

    // citizenIdHash => active wallet address (mapping 1-1)
    mapping(bytes32 => address) public citizenWallet;

    // old wallet => tokenIds owned (to facilitate bulk transfer on approval)
    // Note: Actual enumeration depends on the NFT contract's support.

    event RecoveryRequested(
        uint256 indexed requestId,
        bytes32 indexed citizenIdHash,
        address oldWallet,
        address newWallet
    );
    event RecoveryApproved(
        uint256 indexed requestId,
        address oldWallet,
        address newWallet,
        uint256[] transferredTokenIds
    );
    event RecoveryRejected(uint256 indexed requestId, string reason);

    constructor(address _landNFTAddress) {
        landNFTContract = LandNFT(_landNFTAddress);
    }

    /**
     * @dev Registers the initial wallet mapping for a citizen. Only callable by Admin.
     * @param citizenIdHash SHA-256 hash of the citizen's CCCD number.
     * @param wallet The initial wallet address.
     */
    function registerCitizenWallet(bytes32 citizenIdHash, address wallet) external onlyOwner {
        require(citizenWallet[citizenIdHash] == address(0), "Wallet already registered for this citizen");
        require(wallet != address(0), "Invalid wallet address");
        citizenWallet[citizenIdHash] = wallet;
    }

    /**
     * @dev Submits a wallet override/recovery request. Called by Admin on behalf of the citizen.
     * @param citizenIdHash SHA-256 hash of the citizen's CCCD number.
     * @param newWallet The new wallet address to override with.
     */
    function requestWalletOverride(bytes32 citizenIdHash, address newWallet) external onlyOwner returns (uint256) {
        address oldWallet = citizenWallet[citizenIdHash];
        require(oldWallet != address(0), "No wallet registered for this citizen");
        require(newWallet != address(0), "Invalid new wallet address");
        require(newWallet != oldWallet, "New wallet must differ from old wallet");

        requestCount++;
        uint256 newRequestId = requestCount;

        recoveryRequests[newRequestId] = RecoveryRequest({
            requestId: newRequestId,
            citizenIdHash: citizenIdHash,
            oldWallet: oldWallet,
            newWallet: newWallet,
            status: RecoveryStatus.PENDING,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        emit RecoveryRequested(newRequestId, citizenIdHash, oldWallet, newWallet);
        return newRequestId;
    }

    /**
     * @dev Approves a wallet override request and transfers all specified NFTs to the new wallet.
     * Only callable by Admin (Lãnh đạo Sở phê duyệt).
     * @param requestId The recovery request ID.
     * @param tokenIds Array of NFT token IDs currently held by the old wallet to be transferred.
     */
    function approveWalletOverride(uint256 requestId, uint256[] calldata tokenIds) external onlyOwner {
        RecoveryRequest storage req = recoveryRequests[requestId];
        require(req.requestId != 0, "Request does not exist");
        require(req.status == RecoveryStatus.PENDING, "Request is not pending");

        req.status = RecoveryStatus.APPROVED;
        req.resolvedAt = block.timestamp;

        // Update the canonical citizen => wallet mapping
        citizenWallet[req.citizenIdHash] = req.newWallet;

        // Transfer all specified NFTs from oldWallet to newWallet using adminTransfer
        // (bypasses standard approval requirement — authorized by Admin/Owner only)
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            // Verify the token is actually owned by the old wallet before transferring
            if (landNFTContract.ownerOf(tokenId) == req.oldWallet) {
                landNFTContract.adminTransfer(req.oldWallet, req.newWallet, tokenId);
            }
        }

        emit RecoveryApproved(requestId, req.oldWallet, req.newWallet, tokenIds);
    }

    /**
     * @dev Rejects a wallet override request.
     * @param requestId The recovery request ID.
     * @param reason The reason for rejection.
     */
    function rejectWalletOverride(uint256 requestId, string calldata reason) external onlyOwner {
        RecoveryRequest storage req = recoveryRequests[requestId];
        require(req.requestId != 0, "Request does not exist");
        require(req.status == RecoveryStatus.PENDING, "Request is not pending");

        req.status = RecoveryStatus.REJECTED;
        req.resolvedAt = block.timestamp;

        emit RecoveryRejected(requestId, reason);
    }

    /**
     * @dev Returns the current active wallet for a citizen.
     */
    function getWalletByCitizenId(bytes32 citizenIdHash) external view returns (address) {
        return citizenWallet[citizenIdHash];
    }
}
