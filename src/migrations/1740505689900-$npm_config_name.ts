import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740505689900 implements MigrationInterface {
    name = ' $npmConfigName1740505689900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_routes_status_enum" AS ENUM('PROGUESS', 'COMPLETED', 'CANCEL')`);
        await queryRunner.query(`CREATE TABLE "freight_routes" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "freightId" character varying, "userDriveId" character varying, "status" "public"."freight_routes_status_enum" NOT NULL DEFAULT 'PROGUESS', "isActive" boolean NOT NULL DEFAULT true, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6bd5aa61b86cc32558ab095c176" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."freight_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "freight_requests" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "freightId" character varying, "userDriveId" character varying, "status" "public"."freight_requests_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05c6ea6195623335c81b1cd5d14" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD CONSTRAINT "FK_d3baa9b289dd08e4f8cbf5ab1de" FOREIGN KEY ("freightId") REFERENCES "freight"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD CONSTRAINT "FK_8d22c53c59228db67720c5cc329" FOREIGN KEY ("userDriveId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD CONSTRAINT "FK_d699d3fcc566168759d067ed4fc" FOREIGN KEY ("freightId") REFERENCES "freight"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD CONSTRAINT "FK_e5ba7ac7aef79a1c8e8ae1fb304" FOREIGN KEY ("userDriveId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP CONSTRAINT "FK_e5ba7ac7aef79a1c8e8ae1fb304"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP CONSTRAINT "FK_d699d3fcc566168759d067ed4fc"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP CONSTRAINT "FK_8d22c53c59228db67720c5cc329"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP CONSTRAINT "FK_d3baa9b289dd08e4f8cbf5ab1de"`);
        await queryRunner.query(`DROP TABLE "freight_requests"`);
        await queryRunner.query(`DROP TYPE "public"."freight_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "freight_routes"`);
        await queryRunner.query(`DROP TYPE "public"."freight_routes_status_enum"`);
    }

}
