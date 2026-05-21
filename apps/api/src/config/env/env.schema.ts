type RawEnv = Record<string, unknown>;

export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  REDIS_URL: string;
  REDIS_SESSION_TTL_SECONDS: number;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PINATA_JWT: string;
  PINATA_API_BASE: string;
  PINATA_GATEWAY_BASE: string;
  RPC_URL: string;
  CHAIN_ID: number;
  LAND_REGISTRY_CONTRACT_ADDRESS: string;
  LAND_NFT_CONTRACT_ADDRESS: string;
  MULTI_SIG_CONTRACT_ADDRESS?: string;
  WALLET_OVERRIDE_CONTRACT_ADDRESS?: string;
  AUDIT_LOG_CONTRACT_ADDRESS?: string;
  ECONTRACT_CONTRACT_ADDRESS?: string;
  VNEID_BASE_URL: string;
  VNEID_API_KEY: string;
  PAYMENT_CALLBACK_URL: string;
  MASTER_ENCRYPTION_KEY: string;
};

const REQUIRED_KEYS: Array<keyof AppEnv> = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'REDIS_URL',
  'REDIS_SESSION_TTL_SECONDS',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'PINATA_JWT',
  'PINATA_API_BASE',
  'PINATA_GATEWAY_BASE',
  'RPC_URL',
  'CHAIN_ID',
  'LAND_REGISTRY_CONTRACT_ADDRESS',
  'LAND_NFT_CONTRACT_ADDRESS',
  'VNEID_BASE_URL',
  'VNEID_API_KEY',
  'PAYMENT_CALLBACK_URL',
  'MASTER_ENCRYPTION_KEY',
];

function toNumber(value: string, key: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`[env] ${key} must be a valid number.`);
  }
  return parsed;
}

function getString(raw: RawEnv, key: keyof AppEnv): string {
  const value = raw[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function validateEnv(rawEnv: RawEnv): AppEnv {
  const missingKeys = REQUIRED_KEYS.filter((key) => getString(rawEnv, key) === '');

  if (missingKeys.length > 0) {
    throw new Error(`[env] Missing required variables: ${missingKeys.join(', ')}`);
  }

  const env: AppEnv = {
    NODE_ENV: getString(rawEnv, 'NODE_ENV'),
    PORT: toNumber(getString(rawEnv, 'PORT'), 'PORT'),
    DB_HOST: getString(rawEnv, 'DB_HOST'),
    DB_PORT: toNumber(getString(rawEnv, 'DB_PORT'), 'DB_PORT'),
    DB_USERNAME: getString(rawEnv, 'DB_USERNAME'),
    DB_PASSWORD: getString(rawEnv, 'DB_PASSWORD'),
    DB_NAME: getString(rawEnv, 'DB_NAME'),
    REDIS_URL: getString(rawEnv, 'REDIS_URL'),
    REDIS_SESSION_TTL_SECONDS: toNumber(
      getString(rawEnv, 'REDIS_SESSION_TTL_SECONDS'),
      'REDIS_SESSION_TTL_SECONDS',
    ),
    JWT_ACCESS_SECRET: getString(rawEnv, 'JWT_ACCESS_SECRET'),
    JWT_ACCESS_EXPIRES_IN: getString(rawEnv, 'JWT_ACCESS_EXPIRES_IN'),
    JWT_REFRESH_SECRET: getString(rawEnv, 'JWT_REFRESH_SECRET'),
    JWT_REFRESH_EXPIRES_IN: getString(rawEnv, 'JWT_REFRESH_EXPIRES_IN'),
    PINATA_JWT: getString(rawEnv, 'PINATA_JWT'),
    PINATA_API_BASE: getString(rawEnv, 'PINATA_API_BASE'),
    PINATA_GATEWAY_BASE: getString(rawEnv, 'PINATA_GATEWAY_BASE'),
    RPC_URL: getString(rawEnv, 'RPC_URL'),
    CHAIN_ID: toNumber(getString(rawEnv, 'CHAIN_ID'), 'CHAIN_ID'),
    LAND_REGISTRY_CONTRACT_ADDRESS: getString(rawEnv, 'LAND_REGISTRY_CONTRACT_ADDRESS'),
    LAND_NFT_CONTRACT_ADDRESS: getString(rawEnv, 'LAND_NFT_CONTRACT_ADDRESS'),
    MULTI_SIG_CONTRACT_ADDRESS: getString(rawEnv, 'MULTI_SIG_CONTRACT_ADDRESS'),
    WALLET_OVERRIDE_CONTRACT_ADDRESS: getString(rawEnv, 'WALLET_OVERRIDE_CONTRACT_ADDRESS'),
    AUDIT_LOG_CONTRACT_ADDRESS: getString(rawEnv, 'AUDIT_LOG_CONTRACT_ADDRESS'),
    ECONTRACT_CONTRACT_ADDRESS: getString(rawEnv, 'ECONTRACT_CONTRACT_ADDRESS'),
    VNEID_BASE_URL: getString(rawEnv, 'VNEID_BASE_URL'),
    VNEID_API_KEY: getString(rawEnv, 'VNEID_API_KEY'),
    PAYMENT_CALLBACK_URL: getString(rawEnv, 'PAYMENT_CALLBACK_URL'),
    MASTER_ENCRYPTION_KEY: getString(rawEnv, 'MASTER_ENCRYPTION_KEY'),
  };

  return env;
}
