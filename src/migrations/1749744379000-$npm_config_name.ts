import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1749744379000 implements MigrationInterface {
    name = ' $npmConfigName1749744379000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "imageUrl" character varying, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "resolved" boolean NOT NULL DEFAULT false, "userId" character varying, CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feedbacks"`);
    }

}
