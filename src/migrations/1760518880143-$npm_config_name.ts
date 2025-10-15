import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1760518880143 implements MigrationInterface {
  name = ' $npmConfigName1760518880143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company" ADD "siimpUsername" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD "siimpPassword" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD "siimpIntegrationActive" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ALTER COLUMN "email" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP COLUMN "siimpIntegrationActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP COLUMN "siimpPassword"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP COLUMN "siimpUsername"`,
    );
  }
}
