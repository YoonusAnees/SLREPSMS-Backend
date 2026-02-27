import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicle1772224263082 implements MigrationInterface {
    name = 'AddVehicle1772224263082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plate_no" character varying(20) NOT NULL, "type" character varying(50) NOT NULL, "driver_id" uuid, CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_687ed2e98ce7f5c5db4f3528b6" ON "vehicles" ("plate_no") `);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_9c2e0a8772c9e43b32f57bfcfcc" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_9c2e0a8772c9e43b32f57bfcfcc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_687ed2e98ce7f5c5db4f3528b6"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
    }

}
