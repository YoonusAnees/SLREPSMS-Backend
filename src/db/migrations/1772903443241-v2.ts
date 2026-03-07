import { MigrationInterface, QueryRunner } from "typeorm";

export class V21772903443241 implements MigrationInterface {
    name = 'V21772903443241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "verified_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD "verified_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "reviewed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "resolved_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "reviewed_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD "resolved_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_d405942447d2fc1a11dabac9531" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_42eacdf3c8a70ccbc91c0151e8f" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_1ed9ce9b047a11dd6f69d912a20" FOREIGN KEY ("resolved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_1ed9ce9b047a11dd6f69d912a20"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_42eacdf3c8a70ccbc91c0151e8f"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_d405942447d2fc1a11dabac9531"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "resolved_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "reviewed_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "resolved_at"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "reviewed_at"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "verified_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "verified_at"`);
    }

}
