import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1744024378368 implements MigrationInterface {
    name = ' $npmConfigName1744024378368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "assas_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "assas_id"`);
    }

}
