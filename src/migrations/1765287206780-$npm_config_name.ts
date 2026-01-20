import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1765287206780 implements MigrationInterface {
  name = ' $npmConfigName1765287206780';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."integrations_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "integrations" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "companyName" character varying, "contactEmail" character varying, "contactPhone" character varying, "status" "public"."integrations_status_enum" NOT NULL DEFAULT 'ACTIVE', "permissions" jsonb, "metadata" jsonb, "lastUsedAt" TIMESTAMP, "requestCount" integer NOT NULL DEFAULT '0', "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7730aae717c31b61bc9d37139c9" UNIQUE ("username"), CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "trialDays" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "isTrial" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plans-company_billingcycle_enum" AS ENUM('MONTHLY', 'ANNUALLY', 'WEEKLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" ADD "billingCycle" "public"."plans-company_billingcycle_enum" NOT NULL DEFAULT 'MONTHLY'`,
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
      `ALTER TABLE "plans-company" DROP COLUMN "billingCycle"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."plans-company_billingcycle_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" DROP COLUMN "isTrial"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans-company" DROP COLUMN "trialDays"`,
    );
    await queryRunner.query(`DROP TABLE "integrations"`);
    await queryRunner.query(`DROP TYPE "public"."integrations_status_enum"`);
  }
}
