// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LandNFT {
    // Basic LandNFT structure for smoke tests and compilation
    uint256 public totalSupply;

    event NFTMinted(uint256 indexed tokenId, address indexed to);

    function mint(address to) external {
        totalSupply++;
        emit NFTMinted(totalSupply, to);
    }
}
