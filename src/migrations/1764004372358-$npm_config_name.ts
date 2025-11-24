import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1764004372358 implements MigrationInterface {
  name = ' $npmConfigName1764004372358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_count_download_platform_enum" AS ENUM('ios', 'android')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_count_download" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "platform" "public"."users_count_download_platform_enum" NOT NULL, "clickedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a735cd322c9070acbe1a377f695" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "freight" ADD "contactCompanyIds" text`,
    );
    await queryRunner.query(`ALTER TABLE "company" ADD "phoneNumberJson" json`);
    await queryRunner.query(
      `ALTER TABLE "company" ADD "isSucess" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_drive" ADD "isSucess" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "isSucess"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "isSucess"`);
    await queryRunner.query(
      `ALTER TABLE "company" DROP COLUMN "phoneNumberJson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "freight" DROP COLUMN "contactCompanyIds"`,
    );
    await queryRunner.query(`DROP TABLE "users_count_download"`);
    await queryRunner.query(
      `DROP TYPE "public"."users_count_download_platform_enum"`,
    );
  }
}
