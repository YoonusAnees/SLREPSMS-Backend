import { MigrationInterface, QueryRunner } from "typeorm";

export class Officer1772513152363 implements MigrationInterface {
    name = 'Officer1772513152363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "issued_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_4af8774bd42043785b3cb7cf629" FOREIGN KEY ("issued_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_4af8774bd42043785b3cb7cf629"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "issued_by_user_id"`);
    }

}
