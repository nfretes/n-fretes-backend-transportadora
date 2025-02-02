import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738520351140 implements MigrationInterface {
    name = ' $npmConfigName1738520351140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."freight_specieofload_enum" RENAME TO "freight_specieofload_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."freight_specieofload_enum" AS ENUM('Animais', 'Big Bag', 'Bobina', 'Caixas', 'Container', 'Diversos', 'Fardos', 'Fracionada', 'Granel', 'Metro cúbico', 'Milheiro', 'Mudanças', 'Palhetes', 'Passageiros', 'Sacos', 'Tambor', 'Unidades')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "specieOfLoad" TYPE "public"."freight_specieofload_enum" USING "specieOfLoad"::"text"::"public"."freight_specieofload_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_specieofload_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_specieofload_enum_old" AS ENUM('Animais', 'Big Bag', 'Bobina', 'Caixas', 'Contaier', 'Diversos', 'Fardos', 'Fracionada', 'Granel', 'Metro cúbico', 'Milheiro', 'Mudanças', 'Palhetes', 'Passageiros', 'Sacos', 'Tambor', 'Unidades')`);
        await queryRunner.query(`ALTER TABLE "freight" ALTER COLUMN "specieOfLoad" TYPE "public"."freight_specieofload_enum_old" USING "specieOfLoad"::"text"::"public"."freight_specieofload_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."freight_specieofload_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."freight_specieofload_enum_old" RENAME TO "freight_specieofload_enum"`);
    }

}
