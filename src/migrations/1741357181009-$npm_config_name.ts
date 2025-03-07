import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1741357181009 implements MigrationInterface {
    name = ' $npmConfigName1741357181009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD "expiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum" RENAME TO "freight_requests_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'AWAITING_USER_DRIVE_RESPONSE')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum" USING "status"::"text"::"public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" TYPE "public"."freight_requests_status_enum_old" USING "status"::"text"::"public"."freight_requests_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_requests_status_enum_old" RENAME TO "freight_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP COLUMN "expiresAt"`);
    }

}
