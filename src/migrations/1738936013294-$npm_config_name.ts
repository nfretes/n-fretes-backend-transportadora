import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1738936013294 implements MigrationInterface {
    name = ' $npmConfigName1738936013294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."freight_shippinglocation_enum" AS ENUM('Nacional', 'Internacional')`);
        await queryRunner.query(`CREATE TYPE "public"."freight_typeofload_enum" AS ENUM('Completa', 'Complemento')`);
        await queryRunner.query(`CREATE TYPE "public"."freight_specieofload_enum" AS ENUM('Animais', 'Big Bag', 'Bobina', 'Caixas', 'Container', 'Diversos', 'Fardos', 'Fracionada', 'Granel', 'Metro cúbico', 'Milheiro', 'Mudanças', 'Palhetes', 'Passageiros', 'Sacos', 'Tambor', 'Unidades')`);
        await queryRunner.query(`CREATE TYPE "public"."freight_unitymetric_enum" AS ENUM('Por toneladas', 'Por quilos')`);
        await queryRunner.query(`CREATE TYPE "public"."freight_calvalue_enum" AS ENUM('Já sei o valor', 'A combinar')`);
        await queryRunner.query(`CREATE TYPE "public"."freight_toll_enum" AS ENUM('Incluso no valor', 'Pago a parte')`);
        await queryRunner.query(`CREATE TABLE "freight" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "shippingLocation" "public"."freight_shippinglocation_enum" NOT NULL DEFAULT 'Nacional', "originCity" character varying, "originState" character varying, "dateOrigin" TIMESTAMP, "destinyCity" character varying, "destinyState" character varying, "dateReceiver" TIMESTAMP, "typeOfLoad" "public"."freight_typeofload_enum" NOT NULL DEFAULT 'Completa', "lona" boolean NOT NULL DEFAULT false, "tracker" boolean NOT NULL DEFAULT false, "product" character varying, "specieOfLoad" "public"."freight_specieofload_enum" NOT NULL, "weightOfLoad" character varying, "weightOfLoadLenght" character varying, "weightOfLoadHeight" character varying, "weightOfLoadWidth" character varying, "unityMetric" "public"."freight_unitymetric_enum", "valueCall" character varying, "volume" character varying, "security" boolean NOT NULL DEFAULT true, "vehicleTypes" text, "bodyTypes" text, "valueAdvance" double precision DEFAULT '0', "Valuefreight" double precision DEFAULT '0', "calValue" "public"."freight_calvalue_enum" NOT NULL, "Toll" "public"."freight_toll_enum" NOT NULL, "methodPayment" character varying, "observation" character varying, "isActive" boolean NOT NULL DEFAULT true, "openSolicitations" boolean NOT NULL DEFAULT true, "companyId" character varying NOT NULL, "contactCompanyId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f234093c6ea4668afa850736cc7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contact-company" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying, "phoneNumber" character varying, "companyId" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_64ac04214cc686678c740bcdcbe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plans-company" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "description" character varying NOT NULL, "name" character varying NOT NULL, "status" boolean NOT NULL DEFAULT true, "value" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_feaa7f3d6070dc3b79d304da11b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscription-company" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "status" integer DEFAULT '1', "merchantOrderId" character varying, "planId" character varying, "companyId" character varying, "amount" double precision NOT NULL, "nextRecurrency" character varying, "endDate" character varying, "interval" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b5ef6f8e7dec0695fb9c2e3308" UNIQUE ("companyId"), CONSTRAINT "PK_6b313b8f36ba28f4b0aabe20078" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying, "nameFantasy" character varying, "email" character varying NOT NULL, "phoneNumber" character varying, "phoneContact" character varying, "cnpj" character varying, "cpf" character varying, "contractSocial" character varying, "socios" json, "transportCategory" character varying, "password" character varying, "isActive" boolean NOT NULL DEFAULT false, "isCompleted" boolean NOT NULL DEFAULT false, "isOn" boolean NOT NULL DEFAULT false, "antt" character varying, "accessIp" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "documentsUrl" character varying, "zipcode" character varying, "street" character varying, "number" character varying, "city" character varying, "state" character varying, "country" character varying, "complement" character varying, "district" character varying, "photoUrl" character varying, CONSTRAINT "UQ_b0fc567cf51b1cf717a9e8046a1" UNIQUE ("email"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b55d9c6e6adfa3c6de735c5a2e" ON "company" ("cnpj") `);
        await queryRunner.query(`CREATE TABLE "company-users-contacts" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "userId" character varying, "companyId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7577d00a143cad22b47f6c26921" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_drive" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "name" character varying, "email" character varying, "phoneNumber" character varying, "password" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cpf" character varying, "photoFaceURL" character varying, "documentPhotoURL" character varying, "zipcode" character varying, "street" character varying, "number" character varying, "city" character varying, "state" character varying, "country" character varying, "complement" character varying, "district" character varying, "device" character varying, "lastAccess" TIMESTAMP, "accessIp" character varying, "antt" character varying, "cnh" character varying, "pushToken" character varying, "similiary" double precision DEFAULT '0', CONSTRAINT "UQ_88dbabbf26612cd43070c77cc8e" UNIQUE ("email"), CONSTRAINT "PK_1fe3347e9e81854d6a05c590cb3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f3b86d78d49a47d7bf04c6395e" ON "users_drive" ("cpf") `);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_vehicletype_enum" AS ENUM('Three Quarter', 'Fiorino', 'Stump', 'VCL', 'Bit Truck', 'Truck', 'Bi Train', 'Cart', 'Cart LS', 'Road Train', 'Vanderleia', 'allLight', 'threeFour', 'toco', 'allWeight', 'train wheel', 'allAverage')`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_bodytype_enum" AS ENUM('Chest', 'Fridge Chest', 'Refrigerated Chest', 'Sider', 'Bucket', 'Low Grille', 'Bulk Carrier', 'Platform', 'Board', 'Only Horse', 'Bug Container Door', 'Prattle', 'Blinker', 'Cavaqueira', 'Cage', 'Container', 'Hopper', 'Munk', 'Silo', 'Tank')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" character varying NOT NULL DEFAULT gen_random_uuid(), "vehicleType" "public"."vehicles_vehicletype_enum" NOT NULL, "bodyType" "public"."vehicles_bodytype_enum" NOT NULL, "plateNumber" character varying, "plateState" character varying, "renavam" character varying, "year" integer, "color" character varying, "isPlateValid" boolean NOT NULL DEFAULT false, "isRenavamValid" boolean NOT NULL DEFAULT false, "chassi" character varying, "userId" character varying NOT NULL, CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "freight" ADD CONSTRAINT "FK_d0d878470bb7c6f4a91d3b031bb" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "freight" ADD CONSTRAINT "FK_2fe2b618d0bc77f0beff4d67678" FOREIGN KEY ("contactCompanyId") REFERENCES "contact-company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact-company" ADD CONSTRAINT "FK_17c1b13fe108c54e64ce87e08b7" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription-company" ADD CONSTRAINT "FK_284daf34518402bc0145419f94e" FOREIGN KEY ("planId") REFERENCES "plans-company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription-company" ADD CONSTRAINT "FK_b5ef6f8e7dec0695fb9c2e3308c" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company-users-contacts" ADD CONSTRAINT "FK_09d340e4b558171497e80af5f21" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company-users-contacts" ADD CONSTRAINT "FK_7d6efebaea14d203e5ce78ffb2b" FOREIGN KEY ("userId") REFERENCES "users_drive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_20f139b9d79f917ef735efacb00" FOREIGN KEY ("userId") REFERENCES "users_drive"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_20f139b9d79f917ef735efacb00"`);
        await queryRunner.query(`ALTER TABLE "company-users-contacts" DROP CONSTRAINT "FK_7d6efebaea14d203e5ce78ffb2b"`);
        await queryRunner.query(`ALTER TABLE "company-users-contacts" DROP CONSTRAINT "FK_09d340e4b558171497e80af5f21"`);
        await queryRunner.query(`ALTER TABLE "subscription-company" DROP CONSTRAINT "FK_b5ef6f8e7dec0695fb9c2e3308c"`);
        await queryRunner.query(`ALTER TABLE "subscription-company" DROP CONSTRAINT "FK_284daf34518402bc0145419f94e"`);
        await queryRunner.query(`ALTER TABLE "contact-company" DROP CONSTRAINT "FK_17c1b13fe108c54e64ce87e08b7"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP CONSTRAINT "FK_2fe2b618d0bc77f0beff4d67678"`);
        await queryRunner.query(`ALTER TABLE "freight" DROP CONSTRAINT "FK_d0d878470bb7c6f4a91d3b031bb"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_bodytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_vehicletype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3b86d78d49a47d7bf04c6395e"`);
        await queryRunner.query(`DROP TABLE "users_drive"`);
        await queryRunner.query(`DROP TABLE "company-users-contacts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b55d9c6e6adfa3c6de735c5a2e"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "subscription-company"`);
        await queryRunner.query(`DROP TABLE "plans-company"`);
        await queryRunner.query(`DROP TABLE "contact-company"`);
        await queryRunner.query(`DROP TABLE "freight"`);
        await queryRunner.query(`DROP TYPE "public"."freight_toll_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_calvalue_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_unitymetric_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_specieofload_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_typeofload_enum"`);
        await queryRunner.query(`DROP TYPE "public"."freight_shippinglocation_enum"`);
    }

}
