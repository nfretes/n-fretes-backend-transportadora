import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1741358224789 implements MigrationInterface {
    name = ' $npmConfigName1741358224789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD "solicitationsOrder" integer DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP COLUMN "solicitationsOrder"`);
    }

}
