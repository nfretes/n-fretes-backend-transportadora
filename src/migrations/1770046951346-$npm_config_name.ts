import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1770046951346 implements MigrationInterface {
    name = ' $npmConfigName1770046951346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."ui-features_category_enum" RENAME TO "ui-features_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ui-features_category_enum" AS ENUM('FREIGHT', 'DASHBOARD', 'COMPANY', 'USERS', 'REPORTS', 'SETTINGS', 'INTEGRATIONS', 'FINANCIAL', 'ANALYTICS', 'NOTIFICATIONS')`);
        await queryRunner.query(`ALTER TABLE "ui-features" ALTER COLUMN "category" TYPE "public"."ui-features_category_enum" USING "category"::"text"::"public"."ui-features_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ui-features_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ui-features_category_enum_old" AS ENUM('FREIGHT', 'DASHBOARD', 'COMPANY', 'USERS', 'REPORTS', 'SETTINGS', 'INTEGRATIONS', 'FINANCIAL', 'ANALYTICS')`);
        await queryRunner.query(`ALTER TABLE "ui-features" ALTER COLUMN "category" TYPE "public"."ui-features_category_enum_old" USING "category"::"text"::"public"."ui-features_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."ui-features_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ui-features_category_enum_old" RENAME TO "ui-features_category_enum"`);
    }

}
