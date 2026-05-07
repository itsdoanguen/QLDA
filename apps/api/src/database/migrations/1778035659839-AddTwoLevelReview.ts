import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTwoLevelReview1778035659839 implements MigrationInterface {
    name = 'AddTwoLevelReview1778035659839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_records" ADD "reviewed_by_first_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "reviewed_by_first_id"`);
    }

}
