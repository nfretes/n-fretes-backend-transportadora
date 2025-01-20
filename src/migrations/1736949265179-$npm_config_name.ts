import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1736949265179 implements MigrationInterface {
    name = ' $npmConfigName1736949265179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription-company" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."subscription-company_status_enum"`);
        await queryRunner.query(`ALTER TABLE "subscription-company" ADD "status" integer DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription-company" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."subscription-company_status_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "subscription-company" ADD "status" "public"."subscription-company_status_enum" NOT NULL`);
    }

}
