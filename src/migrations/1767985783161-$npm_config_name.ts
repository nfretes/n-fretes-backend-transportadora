import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1767985783161 implements MigrationInterface {
  name = ' $npmConfigName1767985783161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "version_app" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" character varying(20) NOT NULL, "platform" character varying(50), "forceUpdate" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4e17f70b8315eac27d4c52eefba" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "version_app"`);
  }
}
