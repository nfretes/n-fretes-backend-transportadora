import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1740510106279 implements MigrationInterface {
  name = ' $npmConfigName1740510106279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight_routes" ADD CONSTRAINT "FK_1c00aeb4be6577dede47e951726" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "freight_routes" DROP CONSTRAINT "FK_1c00aeb4be6577dede47e951726"`,
    );
  }
}
