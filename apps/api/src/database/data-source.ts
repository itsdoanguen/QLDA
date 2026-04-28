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
import { WalletRecoveryRequest } from '../modules/database/entities/wallet-recovery-request.entity';
import { WalletSecret } from '../modules/database/entities/wallet-secret.entity';
import { Wallet } from '../modules/database/entities/wallet.entity';

const appDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Role, User, Wallet, WalletSecret, WalletRecoveryRequest, SystemLog],
  migrations: ['src/database/migrations/*.ts'],
});

export default appDataSource;
