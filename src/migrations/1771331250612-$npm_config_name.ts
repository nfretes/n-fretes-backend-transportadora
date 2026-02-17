import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1771331250612 implements MigrationInterface {
    name = ' $npmConfigName1771331250612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contact-group" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "companyId" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7bd2ecf4a5d02008455b2966ea2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contact-group-members" ("groupId" character varying NOT NULL, "contactId" character varying NOT NULL, CONSTRAINT "PK_3266f89c232753fe90255ef5b5c" PRIMARY KEY ("groupId", "contactId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_296fb60b8e44aad59279f30621" ON "contact-group-members" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f0f5f0250b53008b3847c3541" ON "contact-group-members" ("contactId") `);
        await queryRunner.query(`ALTER TABLE "contact-group" ADD CONSTRAINT "FK_3bea244cb33d29dd8a8a681ac84" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact-group-members" ADD CONSTRAINT "FK_296fb60b8e44aad59279f30621b" FOREIGN KEY ("groupId") REFERENCES "contact-group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "contact-group-members" ADD CONSTRAINT "FK_9f0f5f0250b53008b3847c35417" FOREIGN KEY ("contactId") REFERENCES "company-users-contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact-group-members" DROP CONSTRAINT "FK_9f0f5f0250b53008b3847c35417"`);
        await queryRunner.query(`ALTER TABLE "contact-group-members" DROP CONSTRAINT "FK_296fb60b8e44aad59279f30621b"`);
        await queryRunner.query(`ALTER TABLE "contact-group" DROP CONSTRAINT "FK_3bea244cb33d29dd8a8a681ac84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f0f5f0250b53008b3847c3541"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_296fb60b8e44aad59279f30621"`);
        await queryRunner.query(`DROP TABLE "contact-group-members"`);
        await queryRunner.query(`DROP TABLE "contact-group"`);
    }

}
