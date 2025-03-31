import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1743008584363 implements MigrationInterface {
    name = ' $npmConfigName1743008584363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."freight_unitymetric_enum" RENAME TO "freight_unitymetric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_unitymetric_enum" AS ENUM('Por toneladas', 'Por quilos', 'Por palhetes')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "unityMetric" TYPE "public"."freight_unitymetric_enum" USING "unityMetric"::"text"::"public"."freight_unitymetric_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_unitymetric_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_unitymetric_enum_old" AS ENUM('Por toneladas', 'Por quilos')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "unityMetric" TYPE "public"."freight_unitymetric_enum_old" USING "unityMetric"::"text"::"public"."freight_unitymetric_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."freight_unitymetric_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_unitymetric_enum_old" RENAME TO "freight_unitymetric_enum"`);
    }

}
