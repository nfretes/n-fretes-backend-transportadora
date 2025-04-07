import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1744052726877 implements MigrationInterface {
    name = ' $npmConfigName1744052726877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "credit_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" character varying, "lastFourDigits" character varying, "brand" character varying NOT NULL, "holderName" character varying NOT NULL, "expirationMonth" character varying NOT NULL, "expirationYear" character varying NOT NULL, "creditCardToken" character varying NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_97c08b6c8d5c1df81bf1a96c43e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "credit_card" ADD CONSTRAINT "FK_6560c287f8fc3e57c006d2d93fd" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_card" DROP CONSTRAINT "FK_6560c287f8fc3e57c006d2d93fd"`);
        await queryRunner.query(`DROP TABLE "credit_card"`);
    }

}
