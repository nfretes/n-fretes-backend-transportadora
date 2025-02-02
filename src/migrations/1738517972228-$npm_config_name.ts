import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738517972228 implements MigrationInterface {
    name = ' $npmConfigName1738517972228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "weightOfLoadLenght" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "weightOfLoadHeight" character varying`);
        await queryRunner.query(`ALTER TABLE "freight" ADD "weightOfLoadWidth" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "weightOfLoadWidth"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "weightOfLoadHeight"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "weightOfLoadLenght"`);
    }

}
