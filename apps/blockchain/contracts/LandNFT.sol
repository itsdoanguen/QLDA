// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LandNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event LandNFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);

    constructor() ERC721("Land Registry Token", "LRT") {}

    /**
     * @dev Mints a new Land NFT. Only the owner (or the LandRegistry contract) can mint.
     * @param to The address of the land owner.
     * @param uri The IPFS CID or metadata URI containing the land details.
     * @return tokenId The newly generated Token ID.
     */
    function mintLandNFT(address to, string memory uri) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(to, newItemId);
        _setTokenURI(newItemId, uri);

        emit LandNFTMinted(newItemId, to, uri);

        return newItemId;
    }
    
    function getTotalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Admin-level forced transfer for wallet recovery (Task T15.2).
     * Bypasses standard approval mechanism — only callable by owner (WalletOverride contract or Admin).
     * @param from The current owner (old wallet).
     * @param to The new wallet address.
     * @param tokenId The NFT token ID to transfer.
     */
    function adminTransfer(address from, address to, uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) == from, "Token not owned by specified address");
        require(to != address(0), "Invalid target address");
        _transfer(from, to, tokenId);
    }
}
