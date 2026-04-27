import 'reflect-metadata';

import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

import { getEnvFilePaths } from '../config/env/env-paths';
import { validateEnv } from '../config/env/env.schema';

for (const filePath of getEnvFilePaths(process.env.NODE_ENV)) {
  loadEnv({
    path: filePath,
    override: false,
  });
}

const env = validateEnv(process.env);

const appDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: ['src/database/migrations/*.ts'],
});

export default appDataSource;
