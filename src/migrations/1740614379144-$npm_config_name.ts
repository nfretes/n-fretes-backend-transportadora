import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740614379144 implements MigrationInterface {
    name = ' $npmConfigName1740614379144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_drive" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "users_drive" ADD "longitude" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "latitude"`);
    }

}
