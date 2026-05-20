// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlanningRegistry
 * @dev Store planning zones and assign land tokenIds to zones for on-chain pre-checks.
 * Supports simple status: SAFE, WARNING, DANGER ("treo").
 */
contract PlanningRegistry is Ownable {
    enum ZoneStatus { SAFE, WARNING, DANGER }

    struct Zone {
        uint256 id;
        string name;
        ZoneStatus status;
        uint256 createdAt;
    }

    // zoneId => Zone
    mapping(uint256 => Zone) public zones;

    // tokenId => zoneId (0 means no zone)
    mapping(uint256 => uint256) public tokenZone;

    event ZoneAdded(uint256 indexed zoneId, string name, ZoneStatus status);
    event ZoneStatusChanged(uint256 indexed zoneId, ZoneStatus oldStatus, ZoneStatus newStatus);
    event TokenAssignedToZone(uint256 indexed tokenId, uint256 indexed zoneId);

    function addZone(uint256 zoneId, string calldata name, ZoneStatus status) external onlyOwner {
        require(zones[zoneId].id == 0, "Zone already exists");
        zones[zoneId] = Zone({ id: zoneId, name: name, status: status, createdAt: block.timestamp });
        emit ZoneAdded(zoneId, name, status);
    }

    function setZoneStatus(uint256 zoneId, ZoneStatus status) external onlyOwner {
        require(zones[zoneId].id != 0, "Zone not found");
        ZoneStatus old = zones[zoneId].status;
        zones[zoneId].status = status;
        emit ZoneStatusChanged(zoneId, old, status);
    }

    function assignTokenToZone(uint256 tokenId, uint256 zoneId) external onlyOwner {
        require(zones[zoneId].id != 0, "Zone not found");
        tokenZone[tokenId] = zoneId;
        emit TokenAssignedToZone(tokenId, zoneId);
    }

    function getTokenZone(uint256 tokenId) external view returns (uint256) {
        return tokenZone[tokenId];
    }

    function isTokenInDanger(uint256 tokenId) external view returns (bool) {
        uint256 zid = tokenZone[tokenId];
        if (zid == 0) return false;
        return zones[zid].status == ZoneStatus.DANGER;
    }
}
