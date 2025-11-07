import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762543981256 implements MigrationInterface {
    name = ' $npmConfigName1762543981256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_count_download_platform_enum" AS ENUM('ios', 'android')`);
        await queryRunner.query(`CREATE TABLE "users_count_download" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "platform" "public"."users_count_download_platform_enum" NOT NULL, "clickedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a735cd322c9070acbe1a377f695" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users_count_download"`);
        await queryRunner.query(`DROP TYPE "public"."users_count_download_platform_enum"`);
    }

}
