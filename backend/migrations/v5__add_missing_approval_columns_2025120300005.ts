import { MigrationInterface, QueryRunner } from "typeorm";

export class v5__add_missing_approval_columns_2025120300005 implements MigrationInterface {
    name = 'v5__add_missing_approval_columns_2025120300005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD "approved_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD "rejected_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD "expires_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP COLUMN "rejected_at"`);
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP COLUMN "approved_at"`);
    }

}
