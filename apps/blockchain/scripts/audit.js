const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const contractDataPath = "./deployed-address.json";
  if (!fs.existsSync(contractDataPath)) {
    console.error("deployed-address.json not found. Please deploy first.");
    process.exit(1);
  }

  const contractData = JSON.parse(fs.readFileSync(contractDataPath, "utf8"));
  if (!contractData.landNFT) {
    console.error("LandNFT address not found in deployed-address.json.");
    process.exit(1);
  }

  const LandNFT = await ethers.getContractFactory("LandNFT");
  const landNFT = await LandNFT.attach(contractData.landNFT);

  const tokenId = process.env.AUDIT_TOKEN_ID;
  if (!tokenId) {
    console.error("Please set AUDIT_TOKEN_ID in environment.");
    process.exit(1);
  }

  console.log(`Auditing Token ID: ${tokenId} on contract ${landNFT.target}`);

  try {
    const owner = await landNFT.ownerOf(tokenId);
    console.log(`[PASS] Token Owner: ${owner}`);
    
    const tokenURI = await landNFT.tokenURI(tokenId);
    console.log(`[PASS] Token URI: ${tokenURI}`);
    
  } catch (error) {
    console.error(`[FAIL] Audit failed: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
