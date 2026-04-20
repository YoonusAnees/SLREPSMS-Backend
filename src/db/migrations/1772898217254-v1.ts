import { MigrationInterface, QueryRunner } from "typeorm";

export class V11772898217254 implements MigrationInterface {
    name = 'V11772898217254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" ADD "plate_no" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "suspected_violation_code" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "requires_officer_review" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "penalty_suggestion_status" character varying(20) NOT NULL DEFAULT 'NONE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "penalty_suggestion_status"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "requires_officer_review"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "suspected_violation_code"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "plate_no"`);
    }

}
