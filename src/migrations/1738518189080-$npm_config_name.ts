import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738518189080 implements MigrationInterface {
    name = ' $npmConfigName1738518189080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "valueFreight"`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "valueAdvance" double precision DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "freight" double precision DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "freight"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "valueAdvance"`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "valueFreight" double precision DEFAULT '0'`);
    }

}
