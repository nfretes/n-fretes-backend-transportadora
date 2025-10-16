import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1760620643872 implements MigrationInterface {
  name = ' $npmConfigName1760620643872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight" ADD "isExclude" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "freight" ADD "isExcludeUserId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight" DROP COLUMN "isExcludeUserId"`,
    );
    await queryRunner.query(`ALTER TABLE "freight" DROP COLUMN "isExclude"`);
  }
}
