import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReceiptCid1780042281461 implements MigrationInterface {
    name = 'AddReceiptCid1780042281461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipts" ADD "receipt_cid" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipts" DROP COLUMN "receipt_cid"`);
    }
}
