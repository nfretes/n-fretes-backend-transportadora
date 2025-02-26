import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740509017844 implements MigrationInterface {
    name = ' $npmConfigName1740509017844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD "companyId" character varying`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD "companyId" character varying`);
        await queryRunner.query(`ALTER TABLE "freight_requests" ADD CONSTRAINT "FK_b12ae6541983935070f6abee0fe" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP CONSTRAINT "FK_b12ae6541983935070f6abee0fe"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "freight_requests" DROP COLUMN "companyId"`);
    }

}
