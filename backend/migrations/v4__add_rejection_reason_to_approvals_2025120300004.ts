import { MigrationInterface, QueryRunner } from "typeorm";

export class v4__add_rejection_reason_to_approvals_2025120300004 implements MigrationInterface {
    name = 'v4__add_rejection_reason_to_approvals_2025120300004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD "rejection_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP COLUMN "rejection_reason"`);
    }

}
