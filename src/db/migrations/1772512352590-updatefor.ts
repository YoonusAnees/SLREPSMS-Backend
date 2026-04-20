import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatefor1772512352590 implements MigrationInterface {
    name = 'Updatefor1772512352590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "created_at"`);
    }

}
