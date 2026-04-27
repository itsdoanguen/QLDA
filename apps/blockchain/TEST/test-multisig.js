const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

async function main() {
    console.log("Starting MultiSigWorkflow Tests against local node...\n");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Default Hardhat network private keys
    const pks = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // admin
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // canBo1
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // canBo2
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // lanhDao1
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"  // creator
    ];

    const admin = new ethers.Wallet(pks[0], provider);
    const canBo1 = new ethers.Wallet(pks[1], provider);
    const canBo2 = new ethers.Wallet(pks[2], provider);
    const lanhDao1 = new ethers.Wallet(pks[3], provider);
    const creator = new ethers.Wallet(pks[4], provider);

    console.log(`Admin address: ${admin.address}`);
    console.log(`CanBo 1: ${canBo1.address}`);
    console.log(`CanBo 2: ${canBo2.address}`);
    console.log(`LanhDao 1: ${lanhDao1.address}`);
    console.log(`Creator: ${creator.address}\n`);

    // Read compiled artifact
    const artifactPath = path.join(
        __dirname,
        "..",
        "artifacts",
        "contracts",
        "MultiSigWorkflow.sol",
        "MultiSigWorkflow.json"
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 1. Deploy the Contract
    console.log("Deploying MultiSigWorkflow...");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, admin);
    const multiSig = await factory.deploy();
    await multiSig.waitForDeployment();
    const contractAddress = await multiSig.getAddress();
    console.log(`MultiSigWorkflow deployed to: ${contractAddress}\n`);

    // Create contract instance connected to admin
    const multiSigAdmin = new ethers.Contract(contractAddress, artifact.abi, admin);

    // 2. Setup Roles
    console.log("Setting up roles...");
    // SignerRole: 1 = CAN_BO, 2 = LANH_DAO
    let adminNonce = await admin.getNonce();
    await (await multiSigAdmin.setUserRole(canBo1.address, 1, { nonce: adminNonce++ })).wait();
    await (await multiSigAdmin.setUserRole(canBo2.address, 1, { nonce: adminNonce++ })).wait();
    await (await multiSigAdmin.setUserRole(lanhDao1.address, 2, { nonce: adminNonce++ })).wait();
    console.log("Roles assigned successfully.\n");

    // 3. Create a Transaction
    console.log("Creating a new transaction (Dossier)...");
    const documentCID = "QmTestDocumentCID123";
    const multiSigCreator = new ethers.Contract(contractAddress, artifact.abi, creator);
    const tx = await multiSigCreator.createTransaction(documentCID);
    const receipt = await tx.wait();
    
    // We assume ID is 1 for the first transaction
    const newTxId = 1;
    console.log(`Transaction created with ID: ${newTxId}\n`);

    let txnData = await multiSigAdmin.transactions(newTxId);
    console.log("Initial Status:", txnData[5] === 0n ? "PENDING" : txnData[5]); // status is 6th element

    // 4. CB1 Signs (Approves)
    console.log("CanBo 1 is signing (Approve)...");
    const multiSigCB1 = new ethers.Contract(contractAddress, artifact.abi, canBo1);
    await (await multiSigCB1.signTransaction(newTxId, true, "")).wait();
    txnData = await multiSigAdmin.transactions(newTxId);
    console.log(`CB Signatures: ${txnData[3]}, Status: ${txnData[5]}`);

    // 5. CB2 Signs (Approves)
    console.log("CanBo 2 is signing (Approve)...");
    const multiSigCB2 = new ethers.Contract(contractAddress, artifact.abi, canBo2);
    await (await multiSigCB2.signTransaction(newTxId, true, "")).wait();
    txnData = await multiSigAdmin.transactions(newTxId);
    console.log(`CB Signatures: ${txnData[3]}, Status: ${txnData[5]}`);

    // 6. LD1 Signs (Approves)
    console.log("LanhDao 1 is signing (Approve)...");
    const multiSigLD1 = new ethers.Contract(contractAddress, artifact.abi, lanhDao1);
    await (await multiSigLD1.signTransaction(newTxId, true, "")).wait();
    txnData = await multiSigAdmin.transactions(newTxId);
    console.log(`LD Signatures: ${txnData[4]}, Status: ${txnData[5] === 1n ? "APPROVED" : txnData[5]}`);

    if (txnData[5] === 1n) {
        console.log("\n✅ MultiSig Workflow test passed: Status is APPROVED.");
    } else {
        throw new Error("Test Failed! Status is not APPROVED.");
    }
}

main().catch((error) => {
    console.error("Test failed with error:", error);
    process.exitCode = 1;
});
