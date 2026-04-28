import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletSecretsAndAddressNormalization20260428102000 implements MigrationInterface {
  name = 'AddWalletSecretsAndAddressNormalization20260428102000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE wallets
      ALTER COLUMN wallet_address TYPE VARCHAR(42)
    `);

    await queryRunner.query(`
      ALTER TABLE wallet_recovery_requests
      ALTER COLUMN old_wallet_address TYPE VARCHAR(42)
    `);

    await queryRunner.query(`
      ALTER TABLE wallet_recovery_requests
      ALTER COLUMN new_wallet_address TYPE VARCHAR(42)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallet_secrets (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(42) NOT NULL UNIQUE REFERENCES wallets(wallet_address) ON DELETE CASCADE,
        encrypted_private_key TEXT NOT NULL,
        iv VARCHAR(24) NOT NULL,
        auth_tag VARCHAR(32) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS wallet_secrets`);

    await queryRunner.query(`
      ALTER TABLE wallets
      ALTER COLUMN wallet_address TYPE VARCHAR(128)
    `);

    await queryRunner.query(`
      ALTER TABLE wallet_recovery_requests
      ALTER COLUMN old_wallet_address TYPE VARCHAR(128)
    `);

    await queryRunner.query(`
      ALTER TABLE wallet_recovery_requests
      ALTER COLUMN new_wallet_address TYPE VARCHAR(128)
    `);
  }
}
