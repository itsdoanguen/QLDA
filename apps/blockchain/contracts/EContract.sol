// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LandRegistry.sol";
import "./LandNFT.sol";

/**
 * @title EContract
 * @dev Smart Contract to manage land purchase agreements (Hợp đồng mua bán điện tử).
 * Requires signatures from 3 parties: Seller (Bên Bán), Buyer (Bên Mua), and Notary/Certifier (Cán bộ công chứng).
 */
contract EContract is Ownable {

    // --- Enums ---

    enum ContractStatus {
        PENDING,   // Đang chờ đủ 3 chữ ký
        COMPLETED, // Đã ký đủ 3 bên
        CANCELLED  // Đã bị huỷ
    }

    // --- Structs ---

    struct PurchaseContract {
        uint256 contractId;
        uint256 tokenId;
        address seller;
        address buyer;
        address certifier; // Cán bộ công chứng / Người chứng thực
        uint256 price;
        bool sellerSigned;
        bool buyerSigned;
        bool certifierSigned;
        ContractStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // --- State Variables ---

    LandRegistry public landRegistryContract;
    uint256 public contractCount;

    // contractId => PurchaseContract
    mapping(uint256 => PurchaseContract) public contracts;

    // tokenId => active contractId
    mapping(uint256 => uint256) public activeContractByToken;

    // --- Events ---

    event ContractCreated(
        uint256 indexed contractId,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        address certifier,
        uint256 price
    );

    event ContractSigned(
        uint256 indexed contractId,
        address indexed signer,
        string role // "seller", "buyer", or "certifier"
    );

    event ContractStatusChanged(
        uint256 indexed contractId,
        ContractStatus newStatus
    );

    // --- Constructor ---

    constructor(address _landRegistryAddress) {
        require(_landRegistryAddress != address(0), "Invalid LandRegistry address");
        landRegistryContract = LandRegistry(_landRegistryAddress);
    }

    // --- Core Functions ---

    /**
     * @dev Creates a new purchase agreement on-chain.
     */
    function createContract(
        uint256 _tokenId,
        address _seller,
        address _buyer,
        address _certifier,
        uint256 _price
    ) external returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_buyer != address(0), "Invalid buyer address");
        require(_certifier != address(0), "Invalid certifier address");
        require(_seller != _buyer, "Seller and buyer must be different");
        require(_price > 0, "Price must be greater than zero");

        // Verify the land status in LandRegistry
        LandRegistry.LandStatus landStatus = landRegistryContract.getLandStatus(_tokenId);
        require(landStatus == LandRegistry.LandStatus.DANG_GIAO_DICH, "Land must be in DANG_GIAO_DICH state");

        // Verify that the seller is the current owner of the NFT
        address nftAddress = address(landRegistryContract.landNFTContract());
        address currentOwner = LandNFT(nftAddress).ownerOf(_tokenId);
        require(currentOwner == _seller, "Seller is not the owner of this land token");

        // If there's an active contract for this tokenId, it must not be PENDING
        uint256 activeId = activeContractByToken[_tokenId];
        if (activeId != 0) {
            require(contracts[activeId].status != ContractStatus.PENDING, "Active contract already exists for this token");
        }

        contractCount++;
        uint256 newContractId = contractCount;

        contracts[newContractId] = PurchaseContract({
            contractId: newContractId,
            tokenId: _tokenId,
            seller: _seller,
            buyer: _buyer,
            certifier: _certifier,
            price: _price,
            sellerSigned: false,
            buyerSigned: false,
            certifierSigned: false,
            status: ContractStatus.PENDING,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        activeContractByToken[_tokenId] = newContractId;

        emit ContractCreated(newContractId, _tokenId, _seller, _buyer, _certifier, _price);
        return newContractId;
    }

    /**
     * @dev Signs the purchase agreement.
     */
    function signContract(uint256 _contractId) external {
        PurchaseContract storage c = contracts[_contractId];
        require(c.contractId != 0, "Contract does not exist");
        require(c.status == ContractStatus.PENDING, "Contract is not pending");

        bool isParty = false;
        string memory role = "";

        if (msg.sender == c.seller) {
            require(!c.sellerSigned, "Seller already signed");
            c.sellerSigned = true;
            isParty = true;
            role = "seller";
        } else if (msg.sender == c.buyer) {
            require(!c.buyerSigned, "Buyer already signed");
            c.buyerSigned = true;
            isParty = true;
            role = "buyer";
        } else if (msg.sender == c.certifier) {
            require(!c.certifierSigned, "Certifier already signed");
            c.certifierSigned = true;
            isParty = true;
            role = "certifier";
        }

        require(isParty, "Sender is not authorized to sign this contract");
        c.updatedAt = block.timestamp;
        
        emit ContractSigned(_contractId, msg.sender, role);

        // Check if all 3 parties have signed
        if (c.sellerSigned && c.buyerSigned && c.certifierSigned) {
            c.status = ContractStatus.COMPLETED;
            emit ContractStatusChanged(_contractId, ContractStatus.COMPLETED);
        }
    }

    /**
     * @dev Cancels the contract. Can be done by any of the 3 parties or owner if PENDING.
     */
    function cancelContract(uint256 _contractId) external {
        PurchaseContract storage c = contracts[_contractId];
        require(c.contractId != 0, "Contract does not exist");
        require(c.status == ContractStatus.PENDING, "Contract is not pending");
        require(
            msg.sender == c.seller || msg.sender == c.buyer || msg.sender == c.certifier || msg.sender == owner(),
            "Not authorized to cancel"
        );

        c.status = ContractStatus.CANCELLED;
        c.updatedAt = block.timestamp;

        emit ContractStatusChanged(_contractId, ContractStatus.CANCELLED);
    }

    /**
     * @dev Gets contract details.
     */
    function getContract(uint256 _contractId) external view returns (PurchaseContract memory) {
        require(contracts[_contractId].contractId != 0, "Contract does not exist");
        return contracts[_contractId];
    }
}
