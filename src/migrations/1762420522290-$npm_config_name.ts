import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762420522290 implements MigrationInterface {
    name = ' $npmConfigName1762420522290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "phoneNumberJson" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "phoneNumberJson"`);
    }

}
