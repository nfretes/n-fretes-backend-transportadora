import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738517116389 implements MigrationInterface {
    name = ' $npmConfigName1738517116389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" ADD "valueCall" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "valueCall"`);
    }

}
