import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeRecordIdNullableInLandFiles1777429969158 implements MigrationInterface {
    name = 'MakeRecordIdNullableInLandFiles1777429969158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_files" ALTER COLUMN "record_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_files" ALTER COLUMN "record_id" SET NOT NULL`);
    }


}
