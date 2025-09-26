import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1758825787846 implements MigrationInterface {
    name = ' $npmConfigName1758825787846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "freight_quotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "date" character varying NOT NULL, "commodity" character varying NOT NULL, "origin" character varying NOT NULL, "destination" character varying NOT NULL, "typeFlag" character varying, "predictedFreight" numeric(10,2) NOT NULL, "horizonPredictions" json NOT NULL, "distance" bigint NOT NULL, "duration" integer NOT NULL, "monthlyTotal" integer NOT NULL, "anttData" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06a77f0310e4f7b391924ce0b14" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5ff50ff8c542353cad6c0820b9" ON "freight_quotes" ("origin", "destination", "commodity") `);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum" RENAME TO "freight_requests_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE', 'DRIVER_CONFIRMED_DELIVERY', 'DELIVERY_COMPLETED', 'NOT_CONFIRMED_DELIVERY')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum" USING "status"::"text"::"public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE', 'DRIVER_CONFIRMED_DELIVERY', 'DELIVERY_COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum_old" USING "status"::"text"::"public"."freight_requests_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum_old" RENAME TO "freight_requests_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ff50ff8c542353cad6c0820b9"`);
        await queryRunner.query(`DROP TABLE "freight_quotes"`);
    }

}
