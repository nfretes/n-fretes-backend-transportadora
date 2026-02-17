import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1770045978564 implements MigrationInterface {
    name = ' $npmConfigName1770045978564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ui-features_type_enum" AS ENUM('SCREEN', 'BUTTON', 'COMPONENT', 'TAB', 'MENU_ITEM', 'SECTION')`);
        await queryRunner.query(`CREATE TYPE "public"."ui-features_category_enum" AS ENUM('FREIGHT', 'DASHBOARD', 'COMPANY', 'USERS', 'REPORTS', 'SETTINGS', 'INTEGRATIONS', 'FINANCIAL', 'ANALYTICS')`);
        await queryRunner.query(`CREATE TABLE "ui-features" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "type" "public"."ui-features_type_enum" NOT NULL, "category" "public"."ui-features_category_enum" NOT NULL, "parentKey" character varying, "isVisible" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL DEFAULT '0', "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b633b790c613ab27d2c52e1e03c" UNIQUE ("key"), CONSTRAINT "PK_a067911c3d5bd7c2e8402450954" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ui-features"`);
        await queryRunner.query(`DROP TYPE "public"."ui-features_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ui-features_type_enum"`);
    }

}
