import { MigrationInterface, QueryRunner } from "typeorm";

export class IncidentEvidencce1772614816780 implements MigrationInterface {
    name = 'IncidentEvidencce1772614816780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" ADD "evidence" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "evidence"`);
    }

}
