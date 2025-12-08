import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1765200903937 implements MigrationInterface {
  name = ' $npmConfigName1765200903937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "trialDays" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "isTrial" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription-company" ADD "trialStartDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription-company" ADD "trialEndDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription-company" ADD "isInTrial" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription-company" DROP COLUMN "isInTrial"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription-company" DROP COLUMN "trialEndDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription-company" DROP COLUMN "trialStartDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" DROP COLUMN "isTrial"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" DROP COLUMN "trialDays"`,
    );
  }
}
