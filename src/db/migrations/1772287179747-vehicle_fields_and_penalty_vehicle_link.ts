import { MigrationInterface, QueryRunner } from "typeorm";

export class VehicleFieldsAndPenaltyVehicleLink1772287179747 implements MigrationInterface {
    name = 'VehicleFieldsAndPenaltyVehicleLink1772287179747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "model" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "color" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "year" integer`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "insurance_expiry" date`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "ownership_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD "vehicle_id" uuid`);
        await queryRunner.query(`ALTER TABLE "penalties" ADD CONSTRAINT "FK_6c8e9ab2403f5e8224fed55826d" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "penalties" DROP CONSTRAINT "FK_6c8e9ab2403f5e8224fed55826d"`);
        await queryRunner.query(`ALTER TABLE "penalties" DROP COLUMN "vehicle_id"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "ownership_verified"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "insurance_expiry"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "model"`);
    }

}
