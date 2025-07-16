import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1752688414552 implements MigrationInterface {
    name = ' $npmConfigName1752688414552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "cpf" character varying`);
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "password" character varying`);
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
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "cpf"`);
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "email"`);
    }

}
