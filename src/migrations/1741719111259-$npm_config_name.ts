import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1741719111259 implements MigrationInterface {
    name = ' $npmConfigName1741719111259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "originLongitude" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "originLatitude" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "destinyLongitude" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "destinyLatitude" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "distance" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "destinyLatitude"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "destinyLongitude"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "originLatitude"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "originLongitude"`);
    }

}
