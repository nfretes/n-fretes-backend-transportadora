import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1739208104878 implements MigrationInterface {
  name = ' $npmConfigName1739208104878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_location" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "userId" character varying, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "city" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP, CONSTRAINT "PK_1523fb2aebce55b9e820122ee0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_location" ADD CONSTRAINT "FK_a7f8313e66eb546279fd366882b" FOREIGN KEY ("userId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_location" DROP CONSTRAINT "FK_a7f8313e66eb546279fd366882b"`,
    );
    await queryRunner.query(`DROP TABLE "users_location"`);
  }
}
