import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762347465621 implements MigrationInterface {
    name = ' $npmConfigName1762347465621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "isSucess" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users_drive" ADD "isSucess" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "isSucess"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "isSucess"`);
    }

}
