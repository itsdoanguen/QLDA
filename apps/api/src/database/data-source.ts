import 'reflect-metadata';

import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

import * as path from 'path';

import { validateEnv } from '../config/env/env.schema';

// __dirname = .../apps/api/src/database → ../../ = apps/api/
const apiRoot = path.resolve(__dirname, '../../');
const nodeEnv = process.env.NODE_ENV || 'development';
const envCandidates = [
  path.join(apiRoot, `.env.${nodeEnv}.local`),
  path.join(apiRoot, `.env.${nodeEnv}`),
  path.join(apiRoot, '.env.local'),
  path.join(apiRoot, '.env'),
];

for (const filePath of envCandidates) {
  loadEnv({ path: filePath, override: false });
}

const env = validateEnv(process.env);

import { Role } from '../modules/database/entities/role.entity';
import { SystemLog } from '../modules/database/entities/system-log.entity';
import { User } from '../modules/database/entities/user.entity';
import { Department } from '../modules/database/entities/department.entity';
import { WalletRecoveryRequest } from '../modules/database/entities/wallet-recovery-request.entity';
import { WalletSecret } from '../modules/database/entities/wallet-secret.entity';
import { Wallet } from '../modules/database/entities/wallet.entity';
import { AuthIdentity } from '../modules/database/entities/auth-identity.entity';
import { UserSession } from '../modules/database/entities/user-session.entity';
import { LandRecord } from '../modules/database/entities/land-record.entity';
import { LandRecordVersion } from '../modules/database/entities/land-record-version.entity';
import { LandFile } from '../modules/database/entities/land-file.entity';
import { BlockchainLog } from '../modules/database/entities/blockchain-log.entity';
import { SmartContract } from '../modules/database/entities/smart-contract.entity';
import { LandNFT } from '../modules/database/entities/land-nft.entity';
import { CachedProvenanceLog } from '../modules/database/entities/cached-provenance-log.entity';
import { ApprovalRequest } from '../modules/database/entities/approval-request.entity';
import { Signature } from '../modules/database/entities/signature.entity';
import { Transaction } from '../modules/database/entities/transaction.entity';
import { TaxFee } from '../modules/database/entities/tax-fee.entity';
import { Receipt } from '../modules/database/entities/receipt.entity';
import { PlanningZone } from '../modules/database/entities/planning-zone.entity';
import { LandPlanningMap } from '../modules/database/entities/land-planning-map.entity';
import { Dispute } from '../modules/database/entities/dispute.entity';
import { Mortgage } from '../modules/database/entities/mortgage.entity';
import { FraudReport } from '../modules/database/entities/fraud-report.entity';
import { SystemConfig } from '../modules/database/entities/system-config.entity';
import { SystemConfigAudit } from '../modules/database/entities/system-config-audit.entity';
import { Notification } from '../modules/database/entities/notification.entity';

const appDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [
    Role,
    User,
    Department,
    Wallet,
    WalletSecret,
    WalletRecoveryRequest,
    SystemLog,
    AuthIdentity,
    UserSession,
    LandRecord,
    LandRecordVersion,
    LandFile,
    BlockchainLog,
    SmartContract,
    LandNFT,
    CachedProvenanceLog,
    ApprovalRequest,
    Signature,
    Transaction,
    TaxFee,
    Receipt,
    PlanningZone,
    LandPlanningMap,
    Dispute,
    Mortgage,
    FraudReport,
    SystemConfig,
    SystemConfigAudit,
    Notification,
  ],
  migrations: ['src/database/migrations/*.ts'],
});

export default appDataSource;
