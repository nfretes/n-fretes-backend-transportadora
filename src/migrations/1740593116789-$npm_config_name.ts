import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1740593116789 implements MigrationInterface {
    name = ' $npmConfigName1740593116789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews_user_drive" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "freightId" character varying, "userDriveId" character varying, "companyId" character varying, "rating" integer, "comment" text, "tags" text NOT NULL, CONSTRAINT "PK_9230b479f4e42edc3728dafb65f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "achievements" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "description" text, "requiredTags" integer, "tagId" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_b2d2ec6547a003ee5b43a71dbe3" UNIQUE ("name"), CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_drive_achievements" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "achievementId" character varying, "userDriveId" character varying, "achievedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9e15563c5284e21c5364940a17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD "avalationCompany" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "freight_routes" ADD "avalationUserDrive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users_drive" ADD "isOnRoute" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" ADD CONSTRAINT "FK_14733674291e09631003fca8233" FOREIGN KEY ("userDriveId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" ADD CONSTRAINT "FK_9992a76a2fc5c025626975792fd" FOREIGN KEY ("freightId") REFERENCES "freight"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" ADD CONSTRAINT "FK_9a369ea54a3c7bd3eb76a48fe76" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_drive_achievements" ADD CONSTRAINT "FK_fa9d15c65d35e548231d36b1250" FOREIGN KEY ("userDriveId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_drive_achievements" ADD CONSTRAINT "FK_df84f07597da3359a3b5dbbea0d" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_drive_achievements" DROP CONSTRAINT "FK_df84f07597da3359a3b5dbbea0d"`);
        await queryRunner.query(`ALTER TABLE "user_drive_achievements" DROP CONSTRAINT "FK_fa9d15c65d35e548231d36b1250"`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" DROP CONSTRAINT "FK_9a369ea54a3c7bd3eb76a48fe76"`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" DROP CONSTRAINT "FK_9992a76a2fc5c025626975792fd"`);
        await queryRunner.query(`ALTER TABLE "reviews_user_drive" DROP CONSTRAINT "FK_14733674291e09631003fca8233"`);
        await queryRunner.query(`ALTER TABLE "users_drive" DROP COLUMN "isOnRoute"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP COLUMN "avalationUserDrive"`);
        await queryRunner.query(`ALTER TABLE "freight_routes" DROP COLUMN "avalationCompany"`);
        await queryRunner.query(`DROP TABLE "user_drive_achievements"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
        await queryRunner.query(`DROP TABLE "reviews_user_drive"`);
    }

}
