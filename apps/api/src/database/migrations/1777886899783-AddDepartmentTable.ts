import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentTable1777886899783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "departments" (
                "id" SERIAL NOT NULL, 
                "department_code" character varying(50) NOT NULL, 
                "department_name" character varying(255) NOT NULL, 
                "description" text, 
                CONSTRAINT "UQ_dept_code" UNIQUE ("department_code"), 
                CONSTRAINT "PK_dept_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ADD "department_id" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ADD CONSTRAINT "FK_user_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_user_department"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department_id"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
