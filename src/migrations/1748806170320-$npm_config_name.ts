import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1748806170320 implements MigrationInterface {
    name = ' $npmConfigName1748806170320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "cpf" character varying`);
        await queryRunner.query(`ALTER TABLE "contact-company" ADD "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "cpf"`);
        await queryRunner.query(`ALTER TABLE "contact-company" DROP COLUMN "email"`);
    }

}
