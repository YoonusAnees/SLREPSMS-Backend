import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriver1771950214704 implements MigrationInterface {
    name = 'AddDriver1771950214704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "license_no" character varying(30) NOT NULL, "current_points" integer NOT NULL DEFAULT '5', "license_status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "suspended_until" TIMESTAMP WITH TIME ZONE, "user_id" uuid, CONSTRAINT "REL_8e224f1b8f05ace7cfc7c76d03" UNIQUE ("user_id"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f1c7a850f228d72b19ca638a4c" ON "drivers" ("license_no") `);
        await queryRunner.query(`ALTER TABLE "drivers" ADD CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1c7a850f228d72b19ca638a4c"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
    }

}
