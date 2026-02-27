import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPenaltiesAndViolationTypes1772048929573 implements MigrationInterface {
    name = 'AddPenaltiesAndViolationTypes1772048929573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "violation_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "title" character varying(120) NOT NULL, "base_fine_lkr" integer NOT NULL, "demerit_points" integer NOT NULL DEFAULT '0', "description" text, CONSTRAINT "PK_4b8f75707326b1ffda3a8ca82c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_058b0cbd60896d80f091f2e854" ON "violation_types" ("code") `);
        await queryRunner.query(`CREATE TABLE "penalties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'UNPAID', "fine_lkr" integer NOT NULL, "demerit_points" integer NOT NULL DEFAULT '0', "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "location_text" character varying(200) NOT NULL, "notes" text, "driver_user_id" uuid, "issued_by_user_id" uuid, "violation_type_id" uuid, CONSTRAINT "PK_c917b09222ad10103d984fc4e7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fca380800954ad9551158baa8f" ON "penalties" ("status") `);
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "licenseStatus"`);
        await queryRunner.query(`CREATE TYPE "public"."drivers_licensestatus_enum" AS ENUM('ACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "licenseStatus" "public"."drivers_licensestatus_enum" NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD CONSTRAINT "FK_eb44bee204fd78eb84a669fd2af" FOREIGN KEY ("driver_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD CONSTRAINT "FK_61e930eee80362184a30813f4ab" FOREIGN KEY ("issued_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD CONSTRAINT "FK_1d0763f291cdc08ad75d9eb3d15" FOREIGN KEY ("violation_type_id") REFERENCES "violation_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "penalties" DROP CONSTRAINT "FK_1d0763f291cdc08ad75d9eb3d15"`);
        await queryRunner.query(`ALTER TABLE "penalties" DROP CONSTRAINT "FK_61e930eee80362184a30813f4ab"`);
        await queryRunner.query(`ALTER TABLE "penalties" DROP CONSTRAINT "FK_eb44bee204fd78eb84a669fd2af"`);
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "licenseStatus"`);
        await queryRunner.query(`DROP TYPE "public"."drivers_licensestatus_enum"`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "licenseStatus" character varying(20) NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fca380800954ad9551158baa8f"`);
        await queryRunner.query(`DROP TABLE "penalties"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_058b0cbd60896d80f091f2e854"`);
        await queryRunner.query(`DROP TABLE "violation_types"`);
    }

}
