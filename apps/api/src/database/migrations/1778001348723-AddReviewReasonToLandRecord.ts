import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewReasonToLandRecord1778001348723 implements MigrationInterface {
    name = 'AddReviewReasonToLandRecord1778001348723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_records" ADD "review_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "review_reason"`);
    }

}
