const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const { Client } = require("pg");
require("dotenv").config();

// ─────────────────────────────────────────────────────
// Consistency Check Script — DB ↔ Blockchain
// Đối soát tokenId, status, owner giữa PostgreSQL và on-chain
// ─────────────────────────────────────────────────────

// --- On-chain status enum (mirrors LandRegistry.LandStatus in Solidity) ---
const LAND_STATUS_ENUM = [
  "KHOI_TAO",       // 0
  "CHO_DUYET",      // 1
  "DA_CAP_SO",      // 2
  "TU_CHOI",        // 3
  "DANG_GIAO_DICH", // 4
  "CHUYEN_NHUONG",  // 5
  "THE_CHAP",       // 6
  "TRANH_CHAP",     // 7
];

/**
 * Maps DB Land_NFTs.status → expected on-chain LandStatus enum values.
 * A DB status may correspond to multiple valid on-chain states.
 *
 * DB statuses:
 *   Normal  → land is idle, should be DA_CAP_SO on chain
 *   Trading → land is being sold, should be DANG_GIAO_DICH on chain
 *   Locked  → land is mortgaged or disputed, should be THE_CHAP or TRANH_CHAP
 */
const DB_TO_CHAIN_STATUS = {
  Normal:  ["DA_CAP_SO", "CHUYEN_NHUONG"],
  Trading: ["DANG_GIAO_DICH"],
  Locked:  ["THE_CHAP", "TRANH_CHAP"],
};

// --- Artifact Loaders ---

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

function loadDeployedAddresses() {
  const deployedPath = path.join(__dirname, "..", "deployed-address.json");

  if (!fs.existsSync(deployedPath)) {
    throw new Error(
      "deployed-address.json not found. Run 'npm run deploy' first."
    );
  }

  return JSON.parse(fs.readFileSync(deployedPath, "utf8"));
}

// --- Environment Helpers ---

function getRpcUrl() {
  return process.env.QUICKNODE_RPC_URL || "http://127.0.0.1:8545";
}

function getDbConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "land_registry",
  };
}

// --- Report Helpers ---

class ConsistencyReport {
  constructor() {
    this.ok = 0;
    this.mismatches = [];
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  addOk() {
    this.ok++;
  }

  addMismatch(tokenId, field, dbValue, chainValue) {
    this.mismatches.push({ tokenId, field, dbValue, chainValue });
  }

  addError(tokenId, message) {
    this.errors.push({ tokenId, message });
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  print() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("  Consistency Check Report");
    console.log("=".repeat(60));
    console.log(`  Duration   : ${elapsed}s`);
    console.log(`  ✅ OK       : ${this.ok}`);
    console.log(`  ⚠️  Warnings : ${this.warnings.length}`);
    console.log(`  ❌ Mismatches: ${this.mismatches.length}`);
    console.log(`  💥 Errors   : ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log("\n--- Warnings ---");
      this.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
    }

    if (this.mismatches.length > 0) {
      console.log("\n--- Mismatches ---");
      this.mismatches.forEach((m) => {
        console.log(
          `  ❌ Token ${m.tokenId} | ${m.field}: DB="${m.dbValue}" vs Chain="${m.chainValue}"`
        );
      });
    }

    if (this.errors.length > 0) {
      console.log("\n--- Errors ---");
      this.errors.forEach((e) => {
        console.log(`  💥 Token ${e.tokenId}: ${e.message}`);
      });
    }

    console.log("=".repeat(60));

    return this.mismatches.length === 0 && this.errors.length === 0;
  }
}

// --- Main Check Logic ---

async function main() {
  console.log("=".repeat(60));
  console.log("  LandContractQLDA — Consistency Check (DB ↔ Blockchain)");
  console.log("=".repeat(60));

  // 1. Load deployed addresses & artifacts
  const deployed = loadDeployedAddresses();
  const landNFTArtifact = loadArtifact("LandNFT");
  const landRegistryArtifact = loadArtifact("LandRegistry");

  const landNFTAddress = deployed.contracts?.LandNFT;
  const landRegistryAddress = deployed.contracts?.LandRegistry;

  if (!landNFTAddress || !landRegistryAddress) {
    // Fallback for legacy deployed-address.json format (single contractAddress)
    throw new Error(
      "deployed-address.json missing contract addresses. Re-run 'npm run deploy'."
    );
  }

  console.log(`  LandNFT      : ${landNFTAddress}`);
  console.log(`  LandRegistry : ${landRegistryAddress}`);

  // 2. Setup Blockchain Connection
  const rpcUrl = getRpcUrl();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  console.log(`  Chain ID     : ${Number(network.chainId)}`);

  const landNFT = new ethers.Contract(
    landNFTAddress,
    landNFTArtifact.abi,
    provider
  );
  const landRegistry = new ethers.Contract(
    landRegistryAddress,
    landRegistryArtifact.abi,
    provider
  );

  // 3. Setup DB Connection
  const dbConfig = getDbConfig();
  console.log(`  DB           : ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);

  const dbClient = new Client(dbConfig);

  try {
    await dbClient.connect();
    console.log("  DB connected ✅");
  } catch (err) {
    console.error(`\n❌ Cannot connect to database: ${err.message}`);
    console.error("   Make sure PostgreSQL is running and .env is configured.");
    console.error(
      "   Required env vars: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME"
    );
    process.exitCode = 1;
    return;
  }

  console.log("=".repeat(60));

  const report = new ConsistencyReport();

  try {
    // ─────────────────────────────────────────
    // Check 1: DB records that have token_id → verify on-chain
    // ─────────────────────────────────────────
    console.log("\n[Check 1] DB Land_NFTs → On-chain verification...");

    const dbResult = await dbClient.query(
      `SELECT token_id, status, owner_wallet, record_id 
       FROM land_nfts 
       WHERE token_id IS NOT NULL 
       ORDER BY CAST(token_id AS INTEGER)`
    );

    if (dbResult.rows.length === 0) {
      report.addWarning("No NFT records found in database (land_nfts table is empty).");
    }

    for (const row of dbResult.rows) {
      const tokenId = row.token_id;
      const dbStatus = row.status;
      const dbOwnerWallet = row.owner_wallet?.toLowerCase();

      try {
        // 1a. Check token existence + owner on LandNFT
        let chainOwner;
        try {
          chainOwner = await landNFT.ownerOf(tokenId);
        } catch {
          report.addError(
            tokenId,
            "Token exists in DB but NOT found on-chain (LandNFT.ownerOf reverted)"
          );
          continue;
        }

        // 1b. Compare owner
        if (dbOwnerWallet && chainOwner.toLowerCase() !== dbOwnerWallet) {
          report.addMismatch(
            tokenId,
            "owner",
            dbOwnerWallet,
            chainOwner.toLowerCase()
          );
        }

        // 1c. Check LandRegistry status
        let chainStatusIndex;
        try {
          chainStatusIndex = await landRegistry.getLandStatus(tokenId);
        } catch {
          report.addWarning(
            `Token ${tokenId} exists on LandNFT but NOT registered in LandRegistry`
          );
          report.addOk(); // NFT exists, just not in registry
          continue;
        }

        const chainStatusName = LAND_STATUS_ENUM[Number(chainStatusIndex)] || `UNKNOWN(${chainStatusIndex})`;

        // 1d. Compare status
        const expectedStatuses = DB_TO_CHAIN_STATUS[dbStatus];
        if (expectedStatuses) {
          if (!expectedStatuses.includes(chainStatusName)) {
            report.addMismatch(tokenId, "status", dbStatus, chainStatusName);
          } else {
            report.addOk();
          }
        } else {
          // DB has unknown status, just log it
          report.addWarning(
            `Token ${tokenId}: Unknown DB status "${dbStatus}" — cannot map to on-chain status`
          );
          report.addOk();
        }

        // 1e. Check pre-check consistency (canTransact / isBlocked)
        const canTransact = await landRegistry.canTransact(tokenId);
        const isBlocked = await landRegistry.isBlocked(tokenId);

        if (dbStatus === "Normal" && !canTransact) {
          report.addMismatch(
            tokenId,
            "canTransact",
            "true (Normal)",
            "false"
          );
        }

        if (dbStatus === "Locked" && !isBlocked) {
          report.addMismatch(
            tokenId,
            "isBlocked",
            "true (Locked)",
            "false"
          );
        }
      } catch (err) {
        report.addError(tokenId, `Unexpected error: ${err.message}`);
      }
    }

    // ─────────────────────────────────────────
    // Check 2: On-chain token count → verify DB has them
    // ─────────────────────────────────────────
    console.log("[Check 2] On-chain totalSupply → DB existence check...");

    let totalSupply;
    try {
      totalSupply = Number(await landNFT.getTotalSupply());
      console.log(`  On-chain totalSupply: ${totalSupply}`);
    } catch {
      report.addWarning("Could not read getTotalSupply() from LandNFT");
      totalSupply = 0;
    }

    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      const dbExists = await dbClient.query(
        "SELECT token_id FROM land_nfts WHERE token_id = $1",
        [String(tokenId)]
      );

      if (dbExists.rows.length === 0) {
        report.addWarning(
          `Token ${tokenId} exists on-chain but NOT in database (land_nfts)`
        );
      }
    }

    // ─────────────────────────────────────────
    // Check 3: Land_Records with status=Minted but no matching NFT
    // ─────────────────────────────────────────
    console.log("[Check 3] Land_Records (Minted) → NFT existence check...");

    const mintedRecords = await dbClient.query(
      `SELECT lr.id, ln.token_id 
       FROM land_records lr
       LEFT JOIN land_nfts ln ON ln.record_id = lr.id
       WHERE lr.status = 'Minted'`
    );

    for (const row of mintedRecords.rows) {
      if (!row.token_id) {
        report.addWarning(
          `Land_Record id=${row.id} has status 'Minted' but no NFT in land_nfts table`
        );
      }
    }
  } finally {
    await dbClient.end();
    console.log("\n  DB disconnected.");
  }

  // Print final report
  const isConsistent = report.print();

  if (!isConsistent) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Consistency check failed:", error.message || error);
  process.exitCode = 1;
});
