import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIncident1772613321853 implements MigrationInterface {
    name = 'UpdateIncident1772613321853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" ADD "evidence" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "evidence"`);
    }

}
