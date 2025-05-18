import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1747579862734 implements MigrationInterface {
    name = ' $npmConfigName1747579862734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plan-features" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "description" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8ff359688a9c1d3f83cd71a06ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan-feature-limits" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "planId" character varying NOT NULL, "featureId" character varying NOT NULL, "monthlyLimit" integer, "included" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c03c4cad1cd1226211b0baac9c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature-logs" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "subscriptionId" character varying NOT NULL, "featureId" character varying NOT NULL, "quantityChange" integer NOT NULL, "metadata" jsonb, "relatedEntityId" character varying, "description" character varying, "loggedAt" TIMESTAMP NOT NULL DEFAULT now(), "performedById" character varying, "performedByType" character varying, CONSTRAINT "PK_4065516e699dc5640abb68ca702" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature-usage" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "subscriptionId" character varying NOT NULL, "featureId" character varying NOT NULL, "quantityUsed" integer NOT NULL, "metadata" jsonb, "usedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f2d1a8a1c9c4c3f0dc64dc966a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."freight_unitymetric_enum" RENAME TO "freight_unitymetric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_unitymetric_enum" AS ENUM('Por toneladas', 'Por quilos', 'Por palhetes')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "unityMetric" TYPE "public"."freight_unitymetric_enum" USING "unityMetric"::"text"::"public"."freight_unitymetric_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_unitymetric_enum_old"`);
        await queryRunner.query(`ALTER TABLE "plan-feature-limits" ADD CONSTRAINT "FK_fd1cb56d90034ea4485d47b6550" FOREIGN KEY ("planId") REFERENCES "plans-company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan-feature-limits" ADD CONSTRAINT "FK_216c8975930ebbb5cde8d470860" FOREIGN KEY ("featureId") REFERENCES "plan-features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature-logs" ADD CONSTRAINT "FK_ebe20fa1fef85c2598369cd202f" FOREIGN KEY ("subscriptionId") REFERENCES "subscription-company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature-logs" ADD CONSTRAINT "FK_037ae420a48288b73717c20cbd4" FOREIGN KEY ("featureId") REFERENCES "plan-features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature-usage" ADD CONSTRAINT "FK_37be4c6552714c1e563e0304567" FOREIGN KEY ("subscriptionId") REFERENCES "subscription-company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature-usage" ADD CONSTRAINT "FK_378a033c8cfa7a8e447fcfa0e80" FOREIGN KEY ("featureId") REFERENCES "plan-features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature-usage" DROP CONSTRAINT "FK_378a033c8cfa7a8e447fcfa0e80"`);
        await queryRunner.query(`ALTER TABLE "feature-usage" DROP CONSTRAINT "FK_37be4c6552714c1e563e0304567"`);
        await queryRunner.query(`ALTER TABLE "feature-logs" DROP CONSTRAINT "FK_037ae420a48288b73717c20cbd4"`);
        await queryRunner.query(`ALTER TABLE "feature-logs" DROP CONSTRAINT "FK_ebe20fa1fef85c2598369cd202f"`);
        await queryRunner.query(`ALTER TABLE "plan-feature-limits" DROP CONSTRAINT "FK_216c8975930ebbb5cde8d470860"`);
        await queryRunner.query(`ALTER TABLE "plan-feature-limits" DROP CONSTRAINT "FK_fd1cb56d90034ea4485d47b6550"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_unitymetric_enum_old" AS ENUM('Por toneladas', 'Por quilos')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "unityMetric" TYPE "public"."freight_unitymetric_enum_old" USING "unityMetric"::"text"::"public"."freight_unitymetric_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."freight_unitymetric_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_unitymetric_enum_old" RENAME TO "freight_unitymetric_enum"`);
        await queryRunner.query(`DROP TABLE "feature-usage"`);
        await queryRunner.query(`DROP TABLE "feature-logs"`);
        await queryRunner.query(`DROP TABLE "plan-feature-limits"`);
        await queryRunner.query(`DROP TABLE "plan-features"`);
    }

}
