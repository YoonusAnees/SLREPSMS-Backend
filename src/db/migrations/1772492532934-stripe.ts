import { MigrationInterface, QueryRunner } from "typeorm";

export class Stripe1772492532934 implements MigrationInterface {
    name = 'Stripe1772492532934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "stripe_payment_intent_id" character varying(80)`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "stripe_client_secret" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "stripe_client_secret"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "stripe_payment_intent_id"`);
    }

}
