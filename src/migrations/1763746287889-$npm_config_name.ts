import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1763746287889 implements MigrationInterface {
    name = ' $npmConfigName1763746287889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "contactCompanyIds" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "contactCompanyIds"`);
    }

}
