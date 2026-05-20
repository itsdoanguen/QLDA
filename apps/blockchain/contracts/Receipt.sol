// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Receipt
 * @dev Simple on-chain receipt registry to record payment receipts and link them to tx hashes.
 * Emits ReceiptRecorded event so backends can index receipts by txHash.
 */
contract Receipt is Ownable {
    struct ReceiptData {
        address payer;
        uint256 amount; // in wei
        string receiptCID; // optional off-chain metadata (IPFS CID)
        uint256 timestamp;
    }

    // txHash (bytes32) => ReceiptData
    mapping(bytes32 => ReceiptData) public receipts;

    event ReceiptRecorded(bytes32 indexed txHash, address indexed payer, uint256 amount, string receiptCID, uint256 timestamp);

    /**
     * @dev Record a receipt tied to a blockchain transaction hash.
     * Only owner (backend/operator) can write receipts to avoid spam.
     */
    function recordReceipt(bytes32 txHash, address payer, uint256 amount, string calldata receiptCID) external onlyOwner {
        require(receipts[txHash].timestamp == 0, "Receipt: already recorded");
        receipts[txHash] = ReceiptData({
            payer: payer,
            amount: amount,
            receiptCID: receiptCID,
            timestamp: block.timestamp
        });

        emit ReceiptRecorded(txHash, payer, amount, receiptCID, block.timestamp);
    }

    /**
     * @dev Read receipt data. Reverts if not found.
     */
    function getReceipt(bytes32 txHash) external view returns (address, uint256, string memory, uint256) {
        ReceiptData storage r = receipts[txHash];
        require(r.timestamp != 0, "Receipt: not found");
        return (r.payer, r.amount, r.receiptCID, r.timestamp);
    }
}
