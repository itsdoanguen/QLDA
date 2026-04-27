// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LandRegistry {
    // Basic LandRegistry structure for smoke tests and compilation
    mapping(uint256 => address) public landOwners;

    event LandRegistered(uint256 indexed landId, address indexed owner);

    function registerLand(uint256 landId) external {
        require(landOwners[landId] == address(0), "Land already registered");
        landOwners[landId] = msg.sender;
        emit LandRegistered(landId, msg.sender);
    }
}
