import { MigrationInterface, QueryRunner } from "typeorm";

export class Fixed1772401987075 implements MigrationInterface {
    name = 'Fixed1772401987075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rescue_teams" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rescue_teams" ADD CONSTRAINT "UQ_98e8b4f2f7c895db70d516ef1b1" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "rescue_teams" ADD CONSTRAINT "FK_98e8b4f2f7c895db70d516ef1b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rescue_teams" DROP CONSTRAINT "FK_98e8b4f2f7c895db70d516ef1b1"`);
        await queryRunner.query(`ALTER TABLE "rescue_teams" DROP CONSTRAINT "UQ_98e8b4f2f7c895db70d516ef1b1"`);
        await queryRunner.query(`ALTER TABLE "rescue_teams" DROP COLUMN "user_id"`);
    }

}
