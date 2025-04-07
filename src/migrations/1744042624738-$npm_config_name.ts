import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1744042624738 implements MigrationInterface {
    name = ' $npmConfigName1744042624738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_paymentmethod_enum" AS ENUM('CREDIT_CARD', 'PIX', 'BOLETO')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "amount" double precision NOT NULL, "reason" character varying, "companyId" character varying, "userId" character varying, "paymentMethod" "public"."transactions_paymentmethod_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c5c4bc0ef04ce5729481c60b559" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users_drive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c5c4bc0ef04ce5729481c60b559"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_paymentmethod_enum"`);
    }

}
