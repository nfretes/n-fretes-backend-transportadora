import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738519580164 implements MigrationInterface {
    name = ' $npmConfigName1738519580164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."vehicles_bodytype_enum" RENAME TO "vehicles_bodytype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_bodytype_enum" AS ENUM('Chest', 'Fridge Chest', 'Refrigerated Chest', 'Sider', 'Bucket', 'Low Grille', 'Bulk Carrier', 'Platform', 'Board', 'Only Horse', 'Bug Container Door', 'Prattle', 'Blinker', 'Cavaqueira', 'Cage', 'Container', 'Hopper', 'Munk', 'Silo', 'Tank')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "bodyType" TYPE "public"."vehicles_bodytype_enum" USING "bodyType"::"text"::"public"."vehicles_bodytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_bodytype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vehicles_bodytype_enum_old" AS ENUM('Chest', 'Fridge Chest', 'Refrigerated Chest', 'Sider', 'Bucket', 'Low Grille', 'Bulk Carrier', 'Platform', 'Board', 'Only Horse', 'Bug Container Door', 'Prattle', 'Blinker', 'Cage', 'Hopper', 'Munk', 'Silo', 'Tank')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "bodyType" TYPE "public"."vehicles_bodytype_enum_old" USING "bodyType"::"text"::"public"."vehicles_bodytype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_bodytype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."vehicles_bodytype_enum_old" RENAME TO "vehicles_bodytype_enum"`);
    }

}
