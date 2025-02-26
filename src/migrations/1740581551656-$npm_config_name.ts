import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740581551656 implements MigrationInterface {
    name = ' $npmConfigName1740581551656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_drive" ADD "isOnRoute" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "isOnRoute"`);
    }

}
