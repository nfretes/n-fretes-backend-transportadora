import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1751984507472 implements MigrationInterface {
    name = ' $npmConfigName1751984507472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exclude" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "cpf" character varying, "cnpj" character varying, "reason" text NOT NULL, "dataSolicitacao" TIMESTAMP NOT NULL DEFAULT now(), "jaExcluido" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b9136b5b3a9fc93c2294b57fc88" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exclude"`);
    }

}
