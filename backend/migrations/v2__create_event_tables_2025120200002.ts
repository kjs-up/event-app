import { MigrationInterface, QueryRunner } from "typeorm";

export class v2__create_event_tables_2025120200002 implements MigrationInterface {
    name = 'v2__create_event_tables_2025120200002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Enums
        await queryRunner.query(`CREATE TYPE "event_projects_eventtype_enum" AS ENUM('training', 'seminar', 'concert', 'entertainment', 'foundation')`);
        await queryRunner.query(`CREATE TYPE "event_projects_status_enum" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'archived')`);
        await queryRunner.query(`CREATE TYPE "event_approvals_action_enum" AS ENUM('approve', 'reject', 'request_revision')`);
        await queryRunner.query(`CREATE TYPE "event_approvals_status_enum" AS ENUM('pending', 'approved', 'rejected', 'expired')`);

        // Create Foundation Templates Table
        await queryRunner.query(`
            CREATE TABLE "foundation_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "event_type" "event_projects_eventtype_enum" NOT NULL,
                "default_capacity" integer NOT NULL,
                "default_is_paid" boolean NOT NULL,
                "default_price" numeric(10,2),
                "default_has_speakers" boolean NOT NULL,
                "configuration" jsonb,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_foundation_templates" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_foundation_templates_event_type_is_active" ON "foundation_templates" ("event_type", "is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_foundation_templates_is_active_created_at" ON "foundation_templates" ("is_active", "created_at")`);

        // Create Event Projects Table
        await queryRunner.query(`
            CREATE TABLE "event_projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "event_type" "event_projects_eventtype_enum" NOT NULL,
                "foundation_template_id" uuid,
                "max_capacity" integer NOT NULL,
                "is_paid" boolean NOT NULL,
                "base_price" numeric(10,2),
                "currency" character varying(3) NOT NULL DEFAULT 'USD',
                "has_speakers" boolean NOT NULL,
                "status" "event_projects_status_enum" NOT NULL DEFAULT 'draft',
                "created_by" uuid NOT NULL,
                "approved_at" TIMESTAMP,
                "approved_by" uuid,
                "rejection_reason" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_event_projects" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_event_projects_status_created_at" ON "event_projects" ("status", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_event_projects_event_type_status" ON "event_projects" ("event_type", "status")`);
        await queryRunner.query(`ALTER TABLE "event_projects" ADD CONSTRAINT "FK_event_projects_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_projects" ADD CONSTRAINT "FK_event_projects_approved_by" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_projects" ADD CONSTRAINT "FK_event_projects_foundation_template_id" FOREIGN KEY ("foundation_template_id") REFERENCES "foundation_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Create Event Approvals Table
        await queryRunner.query(`
            CREATE TABLE "event_approvals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "event_project_id" uuid NOT NULL,
                "approver_id" uuid NOT NULL,
                "submitted_by" uuid NOT NULL,
                "status" "event_approvals_status_enum" NOT NULL DEFAULT 'pending',
                "action" "event_approvals_action_enum",
                "comments" text,
                "processed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_event_approvals" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_event_approvals_status_created_at" ON "event_approvals" ("status", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_event_approvals_approver_status" ON "event_approvals" ("approver_id", "status")`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD CONSTRAINT "FK_event_approvals_event_project_id" FOREIGN KEY ("event_project_id") REFERENCES "event_projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD CONSTRAINT "FK_event_approvals_approver_id" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_approvals" ADD CONSTRAINT "FK_event_approvals_submitted_by" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Event Approvals
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP CONSTRAINT "FK_event_approvals_approver_id"`);
        await queryRunner.query(`ALTER TABLE "event_approvals" DROP CONSTRAINT "FK_event_approvals_event_project_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_approvals_approver_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_approvals_status_created_at"`);
        await queryRunner.query(`DROP TABLE "event_approvals"`);
        await queryRunner.query(`DROP TYPE "event_approvals_status_enum"`);
        await queryRunner.query(`DROP TYPE "event_approvals_action_enum"`);

        // Drop Event Projects
        await queryRunner.query(`ALTER TABLE "event_projects" DROP CONSTRAINT "FK_event_projects_foundation_template_id"`);
        await queryRunner.query(`ALTER TABLE "event_projects" DROP CONSTRAINT "FK_event_projects_approved_by"`);
        await queryRunner.query(`ALTER TABLE "event_projects" DROP CONSTRAINT "FK_event_projects_created_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_projects_event_type_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_projects_status_created_at"`);
        await queryRunner.query(`DROP TABLE "event_projects"`);
        await queryRunner.query(`DROP TYPE "event_projects_status_enum"`);
        await queryRunner.query(`DROP TYPE "event_projects_eventtype_enum"`);

        // Drop Foundation Templates
        await queryRunner.query(`DROP INDEX "public"."IDX_foundation_templates_is_active_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_foundation_templates_event_type_is_active"`);
        await queryRunner.query(`DROP TABLE "foundation_templates"`);
    }

}
