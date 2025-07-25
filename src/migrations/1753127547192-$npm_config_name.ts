import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1753127547192 implements MigrationInterface {
    name = ' $npmConfigName1753127547192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "freight_route_locations" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "latitude" numeric(10,8) NOT NULL, "longitude" numeric(11,8) NOT NULL, "address" character varying, "city" character varying, "state" character varying, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "routeId" character varying NOT NULL, CONSTRAINT "PK_1cb62c40ca7585d0306467d9a80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "freight_route_locations" ADD CONSTRAINT "FK_a3b7e64dc28c9770fefcd42cd70" FOREIGN KEY ("routeId") REFERENCES "freight_routes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_route_locations" DROP CONSTRAINT "FK_a3b7e64dc28c9770fefcd42cd70"`);
        await queryRunner.query(`DROP TABLE "freight_route_locations"`);
    }

}
