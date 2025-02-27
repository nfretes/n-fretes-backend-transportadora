import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740676951386 implements MigrationInterface {
    name = ' $npmConfigName1740676951386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "tracker" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "locator" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "locator"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "tracker"`);
    }

}
