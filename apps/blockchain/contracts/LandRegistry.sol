// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LandNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is Ownable {
    LandNFT public landNFTContract;

    struct LandData {
        bool isRegistered;
        bool isDisputed;
        bool isMortgaged;
    }

    mapping(uint256 => LandData) public lands;

    event LandRegistered(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event LandStatusUpdated(uint256 indexed tokenId, string statusType, bool value);

    constructor(address _landNFTAddress) {
        landNFTContract = LandNFT(_landNFTAddress);
    }

    /**
     * @dev Register a new land by minting an NFT and saving its state
     */
    function registerLand(address to, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = landNFTContract.mintLandNFT(to, tokenURI);
        
        lands[tokenId] = LandData({
            isRegistered: true,
            isDisputed: false,
            isMortgaged: false
        });

        emit LandRegistered(tokenId, to, tokenURI);
        return tokenId;
    }

    function setDisputeStatus(uint256 tokenId, bool status) external onlyOwner {
        require(lands[tokenId].isRegistered, "Land not registered");
        lands[tokenId].isDisputed = status;
        emit LandStatusUpdated(tokenId, "Dispute", status);
    }

    function setMortgageStatus(uint256 tokenId, bool status) external onlyOwner {
        require(lands[tokenId].isRegistered, "Land not registered");
        lands[tokenId].isMortgaged = status;
        emit LandStatusUpdated(tokenId, "Mortgage", status);
    }

    /**
     * @dev Check if land can be transacted
     */
    function canTransact(uint256 tokenId) external view returns (bool) {
        require(lands[tokenId].isRegistered, "Land not registered");
        return (!lands[tokenId].isDisputed && !lands[tokenId].isMortgaged);
    }
}
