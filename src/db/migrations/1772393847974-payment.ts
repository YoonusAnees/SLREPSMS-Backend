import { MigrationInterface, QueryRunner } from "typeorm";

export class Payment1772393847974 implements MigrationInterface {
    name = 'Payment1772393847974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receipt_no" character varying(40) NOT NULL, "amount_lkr" integer NOT NULL, "method" character varying(30) NOT NULL, "gateway" character varying(30) NOT NULL DEFAULT 'SIMULATED', "gateway_ref" character varying(80), "status" character varying(20) NOT NULL DEFAULT 'PENDING', "idempotency_key" character varying(80) NOT NULL, "paid_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "penalty_id" uuid, "paid_by_user_id" uuid, CONSTRAINT "REL_f393e11c655468d216cbf873e6" UNIQUE ("penalty_id"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3b98272cba74c32fe41248e7e3" ON "payments" ("receipt_no") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_59dcef70bd19850783c84f840e" ON "payments" ("idempotency_key") `);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_f393e11c655468d216cbf873e6b" FOREIGN KEY ("penalty_id") REFERENCES "penalties"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d93becae007d3880b7fc0ba1d76" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d93becae007d3880b7fc0ba1d76"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_f393e11c655468d216cbf873e6b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59dcef70bd19850783c84f840e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b98272cba74c32fe41248e7e3"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
