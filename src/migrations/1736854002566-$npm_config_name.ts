import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1736854002566 implements MigrationInterface {
    name = ' $npmConfigName1736854002566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company-users-contacts" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company-users-contacts" DROP COLUMN "isActive"`);
    }

}
