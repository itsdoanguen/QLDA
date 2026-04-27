const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

function loadArtifact() {
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
      "Artifact not found. Run 'npm run compile' before deploying."
    );
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

function getRpcUrl() {
  return process.env.QUICKNODE_RPC_URL || "http://127.0.0.1:8545";
}

function getPrivateKey() {
  if (!process.env.PRIVATE_KEY) {
    // Return a dummy key for testing purpose if not provided, just so `node --check` can pass without issue,
    // actually `node --check` doesn't execute the code, so it's fine to throw error.
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

function writeDeploymentFile(contractAddress, chainId) {
  const outputPath = path.join(__dirname, "..", "deployed-address.json");
  const payload = {
    contractAddress,
    chainId,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
}

async function main() {
  const artifact = loadArtifact();
  const rpcUrl = getRpcUrl();
  const privateKey = getPrivateKey();
  const expectedChainId = getExpectedChainId();

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);

  if (expectedChainId !== null && expectedChainId !== currentChainId) {
    throw new Error(
      `Wrong network: expected chainId ${expectedChainId}, got ${currentChainId}`
    );
  }

  console.log("Deploying LandRegistry contract...");
  console.log(`Chain ID: ${currentChainId}`);
  console.log(`Deployer: ${wallet.address}`);

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  writeDeploymentFile(contractAddress, currentChainId);

  console.log("Deployment successful.");
  console.log(`Contract Address: ${contractAddress}`);
  console.log("Saved to deployed-address.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error.message || error);
  process.exitCode = 1;
});
