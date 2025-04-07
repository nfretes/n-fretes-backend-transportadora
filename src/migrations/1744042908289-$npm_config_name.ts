import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1744042908289 implements MigrationInterface {
    name = ' $npmConfigName1744042908289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_transactiontype_enum" AS ENUM('COMPANY', 'USER')`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transactionType" "public"."transactions_transactiontype_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionType"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_transactiontype_enum"`);
    }

}
