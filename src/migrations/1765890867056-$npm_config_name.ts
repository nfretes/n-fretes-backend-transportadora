import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1765890867056 implements MigrationInterface {
    name = ' $npmConfigName1765890867056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "isToShare" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "isToShare"`);
    }

}
