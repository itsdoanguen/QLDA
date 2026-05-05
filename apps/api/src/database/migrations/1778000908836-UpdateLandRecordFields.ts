import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLandRecordFields1778000908836 implements MigrationInterface {
    name = 'UpdateLandRecordFields1778000908836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_user_department"`);
        await queryRunner.query(`ALTER TABLE "land_records" ADD "plot_number" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "land_records" ADD "parcel_number" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "land_records" ADD "land_type" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "land_records" ADD "assigned_cb_id" integer`);
        await queryRunner.query(`ALTER TABLE "land_records" ALTER COLUMN "status" SET DEFAULT 'Draft'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "land_records" ADD CONSTRAINT "FK_9a4e8eb17bef3511ee1ea3bad4e" FOREIGN KEY ("assigned_cb_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "land_records" DROP CONSTRAINT "FK_9a4e8eb17bef3511ee1ea3bad4e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`);
        await queryRunner.query(`ALTER TABLE "land_records" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "assigned_cb_id"`);
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "land_type"`);
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "parcel_number"`);
        await queryRunner.query(`ALTER TABLE "land_records" DROP COLUMN "plot_number"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_user_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
