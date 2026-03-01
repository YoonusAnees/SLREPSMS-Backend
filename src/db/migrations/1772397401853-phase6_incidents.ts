import { MigrationInterface, QueryRunner } from "typeorm";

export class Phase6Incidents1772397401853 implements MigrationInterface {
    name = 'Phase6Incidents1772397401853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(20) NOT NULL, "severity" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'NEW', "description" text, "location" geography(Point,4326) NOT NULL, "location_text" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reported_by_user_id" uuid, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c566d3b2ca76f043a2da59359a" ON "incidents" USING GiST ("location") `);
        await queryRunner.query(`CREATE TABLE "rescue_teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_code" character varying(30) NOT NULL, "name" character varying(80) NOT NULL, "phone" character varying(20), "status" character varying(20) NOT NULL DEFAULT 'AVAILABLE', "base_location" geography(Point,4326) NOT NULL, "base_location_text" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_829994c458c50d7fa5cec6248da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_542d6461d4d2b3e7e54c5421a7" ON "rescue_teams" ("team_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d549cba25793aad5359afbeb3" ON "rescue_teams" USING GiST ("base_location") `);
        await queryRunner.query(`CREATE TABLE "dispatches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'ASSIGNED', "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "incident_id" uuid, "rescue_team_id" uuid, "dispatched_by_user_id" uuid, CONSTRAINT "PK_e4f5defc12b20b66acf58f5c8b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_61ace48c703d2d17923e59277d" ON "dispatches" ("incident_id", "rescue_team_id") `);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_07e76fb0a4eda527ef6d63a22d1" FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_b9b70e0b5c4566d9c038e604a7c" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_6d744aac94a62e89ee8bf7ab1ce" FOREIGN KEY ("rescue_team_id") REFERENCES "rescue_teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_ba98a289ad901923da332fc85fb" FOREIGN KEY ("dispatched_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_ba98a289ad901923da332fc85fb"`);
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_6d744aac94a62e89ee8bf7ab1ce"`);
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_b9b70e0b5c4566d9c038e604a7c"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_07e76fb0a4eda527ef6d63a22d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61ace48c703d2d17923e59277d"`);
        await queryRunner.query(`DROP TABLE "dispatches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d549cba25793aad5359afbeb3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_542d6461d4d2b3e7e54c5421a7"`);
        await queryRunner.query(`DROP TABLE "rescue_teams"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c566d3b2ca76f043a2da59359a"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
    }

}
