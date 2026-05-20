const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

// ─────────────────────────────────────────────────────
// main.js — Demo: Create a LandRecord on-chain
// Gọi LandRegistry.createLandRecord() để mint NFT và khởi tạo hồ sơ
// ─────────────────────────────────────────────────────

function loadArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found for ${contractName}. Run 'npm run compile' first.`
    );
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

function loadDeployedAddresses() {
  const deployedPath = path.join(__dirname, "deployed-address.json");

  if (!fs.existsSync(deployedPath)) {
    throw new Error(
      "deployed-address.json not found. Run 'npm run deploy' first."
    );
  }

  const data = JSON.parse(fs.readFileSync(deployedPath, "utf8"));

  // Support both new format (contracts object) and legacy (single contractAddress)
  if (data.contracts) {
    return data.contracts;
  }

  // Legacy fallback
  if (data.contractAddress) {
    return { LandRegistry: data.contractAddress };
  }

  throw new Error("deployed-address.json has invalid format.");
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
    const expectedChainId = getExpectedChainId();

    if (!PRIVATE_KEY || !QUICKNODE_RPC_URL) {
      throw new Error(
        "Missing config. Please set PRIVATE_KEY and QUICKNODE_RPC_URL in .env."
      );
    }

    // Load deployed contract addresses
    const addresses = loadDeployedAddresses();
    const landRegistryAddress = addresses.LandRegistry;

    if (!landRegistryAddress) {
      throw new Error(
        "LandRegistry address not found. Run 'npm run deploy' first."
      );
    }

    if (!ethers.isAddress(landRegistryAddress)) {
      throw new Error(`Invalid LandRegistry address: ${landRegistryAddress}`);
    }

    console.log("=".repeat(60));
    console.log("  LandContractQLDA — Create Land Record Demo");
    console.log("=".repeat(60));

    // Step 1: Initialize provider & wallet
    console.log("\n[1/4] Initializing provider and wallet...");
    const provider = new ethers.JsonRpcProvider(QUICKNODE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);

    if (expectedChainId !== null && expectedChainId !== currentChainId) {
      throw new Error(
        `Wrong network: expected chainId ${expectedChainId}, got ${currentChainId}`
      );
    }

    console.log(`  Chain ID : ${currentChainId}`);
    console.log(`  Wallet   : ${wallet.address}`);

    // Step 2: Load contract ABI & connect
    console.log("\n[2/4] Loading LandRegistry contract...");
    const artifact = loadArtifact("LandRegistry");

    const deployedCode = await provider.getCode(landRegistryAddress);
    if (deployedCode === "0x") {
      throw new Error(
        `No contract found at ${landRegistryAddress} on chain ${currentChainId}`
      );
    }

    const landRegistry = new ethers.Contract(
      landRegistryAddress,
      artifact.abi,
      wallet
    );
    console.log(`  LandRegistry: ${landRegistryAddress}`);

    // Step 3: Call createLandRecord()
    // Parameters: to (owner address), tokenURI (IPFS metadata URI)
    const ownerAddress = wallet.address; // Demo: deployer is also the land owner
    const tokenURI = "ipfs://QmDemoTokenURI_" + Date.now(); // Demo metadata

    console.log("\n[3/4] Calling createLandRecord on smart contract...");
    console.log(`  Owner    : ${ownerAddress}`);
    console.log(`  TokenURI : ${tokenURI}`);

    const tx = await landRegistry.createLandRecord(ownerAddress, tokenURI);

    console.log(`  Tx Hash  : ${tx.hash}`);

    // Step 4: Wait for confirmation & extract tokenId from events
    console.log("\n[4/4] Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    // Parse LandCreated event to get the tokenId
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = landRegistry.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        if (parsed && parsed.name === "LandCreated") {
          tokenId = parsed.args.tokenId;
          break;
        }
      } catch {
        // Not a LandRegistry event, skip
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("  ✅ Land record created successfully!");
    console.log("=".repeat(60));

    if (tokenId !== null) {
      console.log(`  Token ID : ${tokenId}`);
    }

    console.log(`  Tx Hash  : ${receipt.hash}`);
    console.log(`  Block    : ${receipt.blockNumber}`);
    console.log(`  Gas Used : ${receipt.gasUsed.toString()}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Execution failed:", error.message || error);
    process.exitCode = 1;
  }
}

main();
