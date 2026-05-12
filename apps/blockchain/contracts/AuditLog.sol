// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuditLog
 * @dev Stores hashes of system logs for tamper-evidence (Task T18.5)
 */
contract AuditLog is Ownable {
    // Mapping from log hash to the timestamp it was recorded
    mapping(bytes32 => uint256) public logHashes;

    event LogHashRecorded(bytes32 indexed logHash, uint256 timestamp, address indexed recorder);

    /**
     * @dev Records a new log hash. Only callable by the owner (backend system).
     * @param logHash The SHA-256 hash of the system log.
     */
    function recordLogHash(bytes32 logHash) external onlyOwner {
        require(logHashes[logHash] == 0, "Log hash already recorded");
        
        logHashes[logHash] = block.timestamp;
        
        emit LogHashRecorded(logHash, block.timestamp, msg.sender);
    }

    /**
     * @dev Batch records multiple log hashes to save gas.
     * @param _logHashes Array of SHA-256 hashes.
     */
    function batchRecordLogHashes(bytes32[] calldata _logHashes) external onlyOwner {
        for (uint256 i = 0; i < _logHashes.length; i++) {
            if (logHashes[_logHashes[i]] == 0) {
                logHashes[_logHashes[i]] = block.timestamp;
                emit LogHashRecorded(_logHashes[i], block.timestamp, msg.sender);
            }
        }
    }

    /**
     * @dev Verifies if a log hash exists and returns its recording timestamp.
     * @param logHash The SHA-256 hash to verify.
     * @return The timestamp when the log was recorded, or 0 if not found.
     */
    function verifyLogHash(bytes32 logHash) external view returns (uint256) {
        return logHashes[logHash];
    }
}
