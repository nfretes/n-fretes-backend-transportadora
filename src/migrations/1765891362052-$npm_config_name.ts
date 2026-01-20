import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1765891362052 implements MigrationInterface {
  name = ' $npmConfigName1765891362052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight" ADD "sourceFreightId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight" DROP COLUMN "sourceFreightId"`,
    );
  }
}
