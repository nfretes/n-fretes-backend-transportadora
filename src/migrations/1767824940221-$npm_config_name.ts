import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1767824940221 implements MigrationInterface {
  name = ' $npmConfigName1767824940221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_favorite_destinations_type_enum" AS ENUM('CITY', 'STATE', 'REGION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_favorite_destinations" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "userId" character varying NOT NULL, "type" "public"."users_favorite_destinations_type_enum" NOT NULL, "name" character varying NOT NULL, "state" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4c7b7c00f65b23318615b0c74b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users_favorite_destinations"`);
    await queryRunner.query(
      `DROP TYPE "public"."users_favorite_destinations_type_enum"`,
    );
  }
}
