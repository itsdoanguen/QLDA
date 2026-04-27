const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const {
  uploadImageToIPFS,
  uploadMetadataToIPFS
} = require("../pinataService");

function resolveContractAddress() {
  if (process.env.CONTRACT_ADDRESS) {
    return process.env.CONTRACT_ADDRESS;
  }

  const deployedInfoPath = path.join(__dirname, "..", "deployed-address.json");
  if (!fs.existsSync(deployedInfoPath)) {
    return null;
  }

  try {
    const deployedInfo = JSON.parse(fs.readFileSync(deployedInfoPath, "utf8"));
    return deployedInfo.contractAddress || null;
  } catch {
    return null;
  }
}

function getExpectedChainId() {
  if (!process.env.EXPECTED_CHAIN_ID) {
    return null;
  }

  const parsed = Number(process.env.EXPECTED_CHAIN_ID);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("EXPECTED_CHAIN_ID must be a positive integer");
  }

  return parsed;
}

async function main() {
  try {
    const { PRIVATE_KEY, QUICKNODE_RPC_URL } = process.env;
    const contractAddress = resolveContractAddress();
    const expectedChainId = getExpectedChainId();

    if (!PRIVATE_KEY || !QUICKNODE_RPC_URL || !contractAddress) {
      throw new Error(
        "Missing config. Please set PRIVATE_KEY and QUICKNODE_RPC_URL in .env, then deploy contract to create CONTRACT_ADDRESS (or deployed-address.json)."
      );
    }

    if (!ethers.isAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    console.log("[1/6] Initializing provider and wallet...");
    const provider = new ethers.JsonRpcProvider(QUICKNODE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);

    if (expectedChainId !== null && expectedChainId !== currentChainId) {
      throw new Error(
        `Wrong network: expected chainId ${expectedChainId}, got ${currentChainId}`
      );
    }

    console.log("[2/6] Loading contract ABI...");
    const artifactPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "LandRegistry.sol",
      "LandRegistry.json"
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(
        "ABI artifact not found. Run: npm run compile before executing this script."
      );
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const deployedCode = await provider.getCode(contractAddress);
    if (deployedCode === "0x") {
      throw new Error(
        `No contract found at ${contractAddress} on chain ${currentChainId}`
      );
    }

    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    console.log("[3/6] Uploading land document image to IPFS via Pinata...");
    const imagePath = path.join(__dirname, "images.jpg");
    const imageCID = await uploadImageToIPFS(imagePath);
    console.log(`Image CID: ${imageCID}`);

    console.log("[4/6] Uploading metadata JSON to IPFS via Pinata...");
    const metadataCID = await uploadMetadataToIPFS(
      "Land Claim Document",
      "Test Land Area",
      "2026",
      imageCID
    );
    console.log(`Metadata CID: ${metadataCID}`);

    const tokenURI = `ipfs://${metadataCID}`;
    console.log(`[INFO] The CID to be saved in MongoDB would be: ${tokenURI}`);

    console.log("[5/6] Calling registerLand on smart contract...");
    // Simulate creating a unique landId for this test based on current timestamp
    const landId = Math.floor(Date.now() / 1000);
    const tx = await contract.registerLand(landId);

    console.log("[6/6] Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    console.log("Register land successfully.");
    console.log(`Land ID Registered: ${landId}`);
    console.log(`Transaction Hash: ${receipt.hash}`);
  } catch (error) {
    console.error("Execution failed:", error.message || error);
    process.exitCode = 1;
  }
}

main();
