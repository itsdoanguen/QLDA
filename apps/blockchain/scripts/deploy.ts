import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Deploy LandRegistry
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();
  const registryAddress = await landRegistry.getAddress();
  console.log(`LandRegistry deployed to: ${registryAddress}`);

  // Deploy LandNFT
  const LandNFT = await ethers.getContractFactory("LandNFT");
  const landNFT = await LandNFT.deploy();
  await landNFT.waitForDeployment();
  const nftAddress = await landNFT.getAddress();
  console.log(`LandNFT deployed to: ${nftAddress}`);

  console.log("Deployment completed.");
  console.log("Please update your .env with:");
  console.log(`LAND_REGISTRY_CONTRACT_ADDRESS=${registryAddress}`);
  console.log(`LAND_NFT_CONTRACT_ADDRESS=${nftAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
