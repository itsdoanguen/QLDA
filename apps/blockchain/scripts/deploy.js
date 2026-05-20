const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

// --- Artifact Loader ---

/**
 * Loads a compiled Hardhat artifact for a given contract.
 * @param {string} contractName - The Solidity file name (without .sol), e.g. "LandNFT"
 * @param {string} [subDir] - Optional subdirectory under contracts/, e.g. "utils"
 * @returns {{ abi: any[], bytecode: string }}
 */
function loadArtifact(contractName, subDir) {
  const contractDir = subDir
    ? path.join("contracts", subDir, `${contractName}.sol`)
    : path.join("contracts", `${contractName}.sol`);

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    contractDir,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found for ${contractName} at ${artifactPath}. Run 'npm run compile' before deploying.`
    );
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

// --- Environment Helpers ---

function getRpcUrl() {
  return process.env.QUICKNODE_RPC_URL || "http://127.0.0.1:8545";
}

function getPrivateKey() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in .env");
  }
  return process.env.PRIVATE_KEY;
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

// --- Deployment Output ---

/**
 * Writes the deployment result to deployed-address.json.
 * Contains addresses for all 5 contracts plus metadata.
 */
function writeDeploymentFile(addresses, chainId) {
  const outputPath = path.join(__dirname, "..", "deployed-address.json");
  const payload = {
    chainId,
    deployedAt: new Date().toISOString(),
    contracts: {
      LandNFT: addresses.LandNFT,
      LandRegistry: addresses.LandRegistry,
      MultiSigWorkflow: addresses.MultiSigWorkflow,
      WalletOverride: addresses.WalletOverride,
      AuditLog: addresses.AuditLog,
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
}

// --- Individual Contract Deployers ---

/**
 * Deploys a contract with no constructor arguments.
 */
async function deploySimple(contractName, wallet) {
  const artifact = loadArtifact(contractName);
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log(`  Deploying ${contractName}...`);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`  ✅ ${contractName} deployed at: ${address}`);
  return { contract, address };
}

/**
 * Deploys a contract that takes a single address as constructor argument.
 */
async function deployWithAddress(contractName, wallet, constructorArg) {
  const artifact = loadArtifact(contractName);
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log(`  Deploying ${contractName}...`);
  const contract = await factory.deploy(constructorArg);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`  ✅ ${contractName} deployed at: ${address}`);
  return { contract, address };
}

// --- Main Deployment Flow ---

async function main() {
  const rpcUrl = getRpcUrl();
  const privateKey = getPrivateKey();
  const expectedChainId = getExpectedChainId();

  // Setup provider & wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);

  if (expectedChainId !== null && expectedChainId !== currentChainId) {
    throw new Error(
      `Wrong network: expected chainId ${expectedChainId}, got ${currentChainId}`
    );
  }

  console.log("=".repeat(60));
  console.log("  LandContractQLDA — Full Contract Deployment");
  console.log("=".repeat(60));
  console.log(`  Chain ID : ${currentChainId}`);
  console.log(`  Deployer : ${wallet.address}`);
  console.log(`  RPC URL  : ${rpcUrl}`);
  console.log("=".repeat(60));

  const addresses = {};

  // ─────────────────────────────────────────────
  // Step 1: Deploy LandNFT (no dependencies)
  // ─────────────────────────────────────────────
  console.log("\n[1/5] LandNFT (ERC-721)");
  const landNFT = await deploySimple("LandNFT", wallet);
  addresses.LandNFT = landNFT.address;

  // ─────────────────────────────────────────────
  // Step 2: Deploy LandRegistry (depends on LandNFT)
  // ─────────────────────────────────────────────
  console.log("\n[2/5] LandRegistry (State Machine)");
  const landRegistry = await deployWithAddress(
    "LandRegistry",
    wallet,
    landNFT.address
  );
  addresses.LandRegistry = landRegistry.address;

  // ─────────────────────────────────────────────
  // Step 3: Deploy MultiSigWorkflow (no dependencies)
  // ─────────────────────────────────────────────
  console.log("\n[3/5] MultiSigWorkflow (Multi-sig Approval)");
  const multiSig = await deploySimple("MultiSigWorkflow", wallet);
  addresses.MultiSigWorkflow = multiSig.address;

  // ─────────────────────────────────────────────
  // Step 4: Deploy WalletOverride (depends on LandNFT)
  // ─────────────────────────────────────────────
  console.log("\n[4/5] WalletOverride (Wallet Recovery)");
  const walletOverride = await deployWithAddress(
    "WalletOverride",
    wallet,
    landNFT.address
  );
  addresses.WalletOverride = walletOverride.address;

  // ─────────────────────────────────────────────
  // Step 5: Deploy AuditLog (no dependencies)
  // ─────────────────────────────────────────────
  console.log("\n[5/5] AuditLog (On-chain Audit Trail)");
  const auditLog = await deploySimple("AuditLog", wallet);
  addresses.AuditLog = auditLog.address;

  // ─────────────────────────────────────────────
  // Step 6: Transfer LandNFT ownership to LandRegistry
  // LandRegistry.createLandRecord() calls LandNFT.mintLandNFT()
  // which is onlyOwner, so LandRegistry must own LandNFT.
  // ─────────────────────────────────────────────
  console.log("\n[Post-deploy] Transferring LandNFT ownership to LandRegistry...");
  const transferTx = await landNFT.contract.transferOwnership(
    landRegistry.address
  );
  await transferTx.wait();
  console.log("  ✅ LandNFT ownership transferred to LandRegistry");

  // ─────────────────────────────────────────────
  // Save all addresses to deployed-address.json
  // ─────────────────────────────────────────────
  writeDeploymentFile(addresses, currentChainId);

  console.log("\n" + "=".repeat(60));
  console.log("  Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\n  Contract Addresses:");
  console.log(`    LandNFT          : ${addresses.LandNFT}`);
  console.log(`    LandRegistry     : ${addresses.LandRegistry}`);
  console.log(`    MultiSigWorkflow : ${addresses.MultiSigWorkflow}`);
  console.log(`    WalletOverride   : ${addresses.WalletOverride}`);
  console.log(`    AuditLog         : ${addresses.AuditLog}`);
  console.log("\n  Saved to deployed-address.json");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Deployment failed:", error.message || error);
  process.exitCode = 1;
});
