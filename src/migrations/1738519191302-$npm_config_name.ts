import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738519191302 implements MigrationInterface {
    name = ' $npmConfigName1738519191302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."vehicles_vehicletype_enum" RENAME TO "vehicles_vehicletype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_vehicletype_enum" AS ENUM('Three Quarter', 'Fiorino', 'Stump', 'VCL', 'Bit Truck', 'Truck', 'Bi Train', 'Cart', 'Cart LS', 'Road Train', 'Vanderleia', 'allLight', 'threeFour', 'toco')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "vehicleType" TYPE "public"."vehicles_vehicletype_enum" USING "vehicleType"::"text"::"public"."vehicles_vehicletype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_vehicletype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vehicles_vehicletype_enum_old" AS ENUM('Three Quarter', 'Fiorino', 'Stump', 'VCL', 'Bit Truck', 'Truck', 'Bi Train', 'Cart', 'Cart LS', 'Road Train', 'Vanderleia')`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "vehicleType" TYPE "public"."vehicles_vehicletype_enum_old" USING "vehicleType"::"text"::"public"."vehicles_vehicletype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_vehicletype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."vehicles_vehicletype_enum_old" RENAME TO "vehicles_vehicletype_enum"`);
    }

}
