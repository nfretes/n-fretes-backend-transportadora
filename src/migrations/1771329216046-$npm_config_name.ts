import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1771329216046 implements MigrationInterface {
    name = ' $npmConfigName1771329216046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "isToShare" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "sourceFreightId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "sourceFreightId"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "isToShare"`);
    }

}
