import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1765211847122 implements MigrationInterface {
  name = ' $npmConfigName1765211847122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."plans-company_billingcycle_enum" AS ENUM('MONTHLY', 'ANNUALLY', 'WEEKLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "billingCycle" "public"."plans-company_billingcycle_enum" NOT NULL DEFAULT 'MONTHLY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans-company" DROP COLUMN "billingCycle"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."plans-company_billingcycle_enum"`,
    );
  }
}
