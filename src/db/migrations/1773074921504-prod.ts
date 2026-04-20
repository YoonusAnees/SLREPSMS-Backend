import { MigrationInterface, QueryRunner } from "typeorm";

export class Prod1773074921504 implements MigrationInterface {
    name = 'Prod1773074921504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" RENAME COLUMN "licenseStatus" TO "license_status"`);
        await queryRunner.query(`ALTER TYPE "public"."drivers_licensestatus_enum" RENAME TO "drivers_license_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."drivers_license_status_enum" RENAME TO "drivers_licensestatus_enum"`);
        await queryRunner.query(`ALTER TABLE "drivers" RENAME COLUMN "license_status" TO "licenseStatus"`);
    }

}
