import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1750179260598 implements MigrationInterface {
    name = ' $npmConfigName1750179260598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "forms" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "email" character varying, "nome" character varying NOT NULL, "whatsapp" character varying NOT NULL, "cnpj" character varying NOT NULL, "served" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "forms"`);
    }

}
