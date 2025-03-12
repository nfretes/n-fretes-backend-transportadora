import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1741783396098 implements MigrationInterface {
    name = ' $npmConfigName1741783396098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" character varying NOT NULL, "type" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "timestamp" character varying NOT NULL, "freightRequestId" character varying, "freightId" character varying, "userDriveId" character varying, "companyId" character varying, "freightRouteId" character varying, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_37ae9d2a894087f2450ff13eb09" FOREIGN KEY ("freightRequestId") REFERENCES "freight_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_5688d34aa37efffe4bdcb7e62c9" FOREIGN KEY ("freightId") REFERENCES "freight"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_5ddfb039e83b1f6b67a34609b17" FOREIGN KEY ("userDriveId") REFERENCES "users_drive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ec0adb47d5237aef2018e3a9745" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_9968a3a9b792aa91b16598b1e85" FOREIGN KEY ("freightRouteId") REFERENCES "freight_routes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_9968a3a9b792aa91b16598b1e85"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ec0adb47d5237aef2018e3a9745"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_5ddfb039e83b1f6b67a34609b17"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_5688d34aa37efffe4bdcb7e62c9"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_37ae9d2a894087f2450ff13eb09"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
