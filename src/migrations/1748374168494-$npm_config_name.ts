import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1748374168494 implements MigrationInterface {
    name = ' $npmConfigName1748374168494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP CONSTRAINT "FK_ee30ff4fd34789d8a5f53351d0d"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP COLUMN "freightRequestId"`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "isFeatured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "expiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum" RENAME TO "freight_requests_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE', 'DRIVER_CONFIRMED_DELIVERY', 'DELIVERY_COMPLETED', 'NOT_CONFIRMED_DELIVERY')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum" USING "status"::"text"::"public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_routes_status_enum" RENAME TO "freight_routes_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_routes_status_enum" AS ENUM('PROGUESS', 'COMPLETED', 'CANCEL')`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" TYPE "public"."freight_routes_status_enum" USING "status"::"text"::"public"."freight_routes_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" SET DEFAULT 'PROGUESS'`);
        await queryRunner.query(`DROP TYPE "public"."freight_routes_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_routes_status_enum_old" AS ENUM('PROGUESS', 'COMPLETED', 'DRIVER_CONFIRMED_DELIVERY', 'CANCEL')`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" TYPE "public"."freight_routes_status_enum_old" USING "status"::"text"::"public"."freight_routes_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ALTER COLUMN "status" SET DEFAULT 'PROGUESS'`);
        await queryRunner.query(`DROP TYPE "public"."freight_routes_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_routes_status_enum_old" RENAME TO "freight_routes_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE', 'DRIVER_CONFIRMED_DELIVERY', 'DELIVERY_COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum_old" USING "status"::"text"::"public"."freight_requests_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum_old" RENAME TO "freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "isFeatured"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD "freightRequestId" character varying`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD CONSTRAINT "FK_ee30ff4fd34789d8a5f53351d0d" FOREIGN KEY ("freightRequestId") REFERENCES "freight_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
