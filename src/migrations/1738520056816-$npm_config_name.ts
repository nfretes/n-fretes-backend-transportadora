import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738520056816 implements MigrationInterface {
    name = ' $npmConfigName1738520056816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" RENAME COLUMN "freight" TO "Valuefreight"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight" RENAME COLUMN "Valuefreight" TO "freight"`);
    }

}
