import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPhase1CoreTables20260420193000 implements MigrationInterface {
  name = 'InitPhase1CoreTables20260420193000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_code VARCHAR(20) NOT NULL UNIQUE,
        role_name VARCHAR(100) NOT NULL,
        description TEXT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id),
        vneid_number VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        wallet_address VARCHAR(128) PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallet_recovery_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        old_wallet_address VARCHAR(128) NOT NULL,
        new_wallet_address VARCHAR(128) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        target_table VARCHAR(100) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        hash_value VARCHAR(128) NOT NULL,
        ip_address VARCHAR(64),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS system_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallet_recovery_requests`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallets`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
  }
}
