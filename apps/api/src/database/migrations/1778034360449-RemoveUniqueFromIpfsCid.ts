import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueFromIpfsCid1778034360449 implements MigrationInterface {
    name = 'RemoveUniqueFromIpfsCid1778034360449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_files" DROP CONSTRAINT "UQ_a0ec52e20157fc853c23944a67b"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_files" ADD CONSTRAINT "UQ_a0ec52e20157fc853c23944a67b" UNIQUE ("ipfs_cid")`);
    }

}
