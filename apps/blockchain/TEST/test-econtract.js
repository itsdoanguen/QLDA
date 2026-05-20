const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

function loadArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
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

async function main() {
  console.log("Starting EContract Tests against local node...\n");

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Default Hardhat network private keys
  const pks = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // admin
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // seller
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // buyer
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"  // certifier
  ];

  const admin = new ethers.Wallet(pks[0], provider);
  const seller = new ethers.Wallet(pks[1], provider);
  const buyer = new ethers.Wallet(pks[2], provider);
  const certifier = new ethers.Wallet(pks[3], provider);

  console.log(`Admin wallet: ${admin.address}`);
  console.log(`Seller wallet: ${seller.address}`);
  console.log(`Buyer wallet: ${buyer.address}`);
  console.log(`Certifier wallet: ${certifier.address}\n`);

  // Load nonces once from provider
  let adminNonce = await provider.getTransactionCount(admin.address);
  let sellerNonce = await provider.getTransactionCount(seller.address);
  let buyerNonce = await provider.getTransactionCount(buyer.address);
  let certifierNonce = await provider.getTransactionCount(certifier.address);

  console.log(`Initial nonces - Admin: ${adminNonce}, Seller: ${sellerNonce}, Buyer: ${buyerNonce}, Certifier: ${certifierNonce}\n`);

  // Load artifacts
  const nftArtifact = loadArtifact("LandNFT");
  const registryArtifact = loadArtifact("LandRegistry");
  const eContractArtifact = loadArtifact("EContract");

  // 1. Deploy LandNFT
  console.log("Deploying LandNFT...");
  let nftFactory = new ethers.ContractFactory(nftArtifact.abi, nftArtifact.bytecode, admin);
  let landNFT = await nftFactory.deploy({ nonce: adminNonce++ });
  await landNFT.waitForDeployment();
  let landNFTAddress = await landNFT.getAddress();
  console.log(`LandNFT deployed to: ${landNFTAddress}`);

  // 2. Deploy LandRegistry
  console.log("Deploying LandRegistry...");
  let registryFactory = new ethers.ContractFactory(registryArtifact.abi, registryArtifact.bytecode, admin);
  let landRegistry = await registryFactory.deploy(landNFTAddress, { nonce: adminNonce++ });
  await landRegistry.waitForDeployment();
  let landRegistryAddress = await landRegistry.getAddress();
  console.log(`LandRegistry deployed to: ${landRegistryAddress}`);

  // 3. Deploy EContract
  console.log("Deploying EContract...");
  let eContractFactory = new ethers.ContractFactory(eContractArtifact.abi, eContractArtifact.bytecode, admin);
  let eContract = await eContractFactory.deploy(landRegistryAddress, { nonce: adminNonce++ });
  await eContract.waitForDeployment();
  let eContractAddress = await eContract.getAddress();
  console.log(`EContract deployed to: ${eContractAddress}\n`);

  // 4. Transfer ownership of LandNFT to LandRegistry
  console.log("Transferring LandNFT ownership to LandRegistry...");
  await (await landNFT.transferOwnership(landRegistryAddress, { nonce: adminNonce++ })).wait();
  console.log("Ownership transferred successfully.\n");

  // 5. Create land record
  console.log("Creating land record for seller...");
  let createTx = await landRegistry.createLandRecord(seller.address, "ipfs://QmLandData123", { nonce: adminNonce++ });
  let createReceipt = await createTx.wait();

  // Parse tokenId from receipt logs
  let tokenId = null;
  for (const log of createReceipt.logs) {
    try {
      const parsed = landRegistry.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });
      if (parsed && parsed.name === "LandCreated") {
        tokenId = parsed.args.tokenId;
        break;
      }
    } catch {}
  }
  console.log(`Created land record with tokenId: ${tokenId}`);

  // 6. Transition land record to DANG_GIAO_DICH
  // KHOI_TAO -> CHO_DUYET
  console.log("Submitting land record for approval...");
  await (await landRegistry.submitForApproval(tokenId, { nonce: adminNonce++ })).wait();
  // CHO_DUYET -> DA_CAP_SO
  console.log("Approving land record (Multi-sig simulation)...");
  await (await landRegistry.approveLand(tokenId, { nonce: adminNonce++ })).wait();
  // DA_CAP_SO -> DANG_GIAO_DICH
  console.log("Starting transaction on land...");
  await (await landRegistry.startTransaction(tokenId, { nonce: adminNonce++ })).wait();

  const status = await landRegistry.getLandStatus(tokenId);
  console.log(`Land status: ${status} (Expected: 4 - DANG_GIAO_DICH)\n`);

  // 7. Create EContract
  console.log("Creating EContract...");
  const eContractAdmin = new ethers.Contract(eContractAddress, eContractArtifact.abi, admin);
  const price = ethers.parseEther("5.5"); // 5.5 ETH

  const createContractTx = await eContractAdmin.createContract(
    tokenId,
    seller.address,
    buyer.address,
    certifier.address,
    price,
    { nonce: adminNonce++ }
  );
  const contractReceipt = await createContractTx.wait();

  // Parse contractId
  let contractId = null;
  for (const log of contractReceipt.logs) {
    try {
      const parsed = eContractAdmin.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });
      if (parsed && parsed.name === "ContractCreated") {
        contractId = parsed.args.contractId;
        break;
      }
    } catch {}
  }
  console.log(`Created EContract with contractId: ${contractId}\n`);

  // 8. Sign contract as Seller, Buyer, Certifier
  const eContractSeller = new ethers.Contract(eContractAddress, eContractArtifact.abi, seller);
  const eContractBuyer = new ethers.Contract(eContractAddress, eContractArtifact.abi, buyer);
  const eContractCertifier = new ethers.Contract(eContractAddress, eContractArtifact.abi, certifier);

  console.log("Signing EContract as Seller...");
  await (await eContractSeller.signContract(contractId, { nonce: sellerNonce++ })).wait();

  console.log("Signing EContract as Buyer...");
  await (await eContractBuyer.signContract(contractId, { nonce: buyerNonce++ })).wait();

  console.log("Signing EContract as Certifier...");
  await (await eContractCertifier.signContract(contractId, { nonce: certifierNonce++ })).wait();

  // 9. Verify Contract Status
  console.log("\nVerifying EContract details...");
  const purchaseContract = await eContractAdmin.getContract(contractId);
  
  console.log(`Contract Status   : ${purchaseContract.status} (Expected: 1 - COMPLETED)`);
  console.log(`Seller Signed     : ${purchaseContract.sellerSigned}`);
  console.log(`Buyer Signed      : ${purchaseContract.buyerSigned}`);
  console.log(`Certifier Signed  : ${purchaseContract.certifierSigned}`);

  if (purchaseContract.status === 1n) {
    console.log("\n🎉 EContract verification SUCCESS!");
  } else {
    throw new Error("EContract status verification failed!");
  }
}

main().catch((error) => {
  console.error("Test failed with error:", error);
  process.exitCode = 1;
});
