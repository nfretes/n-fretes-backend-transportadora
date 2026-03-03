import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1772545721301 implements MigrationInterface {
    name = ' $npmConfigName1772545721301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "route_cache" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "originCity" character varying NOT NULL, "destinationCity" character varying NOT NULL, "tolls" jsonb NOT NULL, "totalToll" numeric(10,2) NOT NULL, "distance" integer NOT NULL, "distanceText" character varying NOT NULL, "duration" character varying NOT NULL, "fuelConsumption" numeric(10,2) NOT NULL, "coordinates" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isValid" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8ee2e2ae6dbf0800b0385d3b6bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc4c1b97fd5c5e50b427c58c42" ON "route_cache" ("originCity", "destinationCity") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_cc4c1b97fd5c5e50b427c58c42"`);
        await queryRunner.query(`DROP TABLE "route_cache"`);
    }

}
