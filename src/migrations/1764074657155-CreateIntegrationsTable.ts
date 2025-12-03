import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntegrationsTable1764074657155
  implements MigrationInterface
{
  name = 'CreateIntegrationsTable1764074657155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."integrations_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "integrations" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "companyName" character varying, "contactEmail" character varying, "contactPhone" character varying, "status" "public"."integrations_status_enum" NOT NULL DEFAULT 'ACTIVE', "permissions" jsonb, "metadata" jsonb, "lastUsedAt" TIMESTAMP, "requestCount" integer NOT NULL DEFAULT '0', "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7730aae717c31b61bc9d37139c9" UNIQUE ("username"), CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "integrations"`);
    await queryRunner.query(`DROP TYPE "public"."integrations_status_enum"`);
  }
}
