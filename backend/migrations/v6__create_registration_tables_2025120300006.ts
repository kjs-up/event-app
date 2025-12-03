import { MigrationInterface, QueryRunner } from "typeorm";

export class v6__create_registration_tables_2025120300006 implements MigrationInterface {
    name = 'v6__create_registration_tables_2025120300006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Registration Status Enum
        await queryRunner.query(`CREATE TYPE "registrations_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in')`);

        // Create Event Batches Table
        await queryRunner.query(`
            CREATE TABLE "event_batches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "event_project_id" uuid NOT NULL,
                "name" character varying(255) NOT NULL,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "capacity" integer NOT NULL,
                "current_registrations" integer NOT NULL DEFAULT 0,
                "is_available" boolean NOT NULL DEFAULT true,
                "price" numeric(10,2),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_event_batches" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_event_batches_event_project_id" ON "event_batches" ("event_project_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_event_batches_start_time" ON "event_batches" ("start_time")`);
        await queryRunner.query(`ALTER TABLE "event_batches" ADD CONSTRAINT "FK_event_batches_event_project_id" FOREIGN KEY ("event_project_id") REFERENCES "event_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Create Participants Table
        await queryRunner.query(`
            CREATE TABLE "participants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "first_name" character varying(255) NOT NULL,
                "last_name" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "phone_number" character varying(50),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_participants" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_participants_email" ON "participants" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_participants_user_id" ON "participants" ("user_id")`);
        await queryRunner.query(`ALTER TABLE "participants" ADD CONSTRAINT "FK_participants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // Create Registrations Table
        await queryRunner.query(`
            CREATE TABLE "registrations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "participant_id" uuid NOT NULL,
                "event_batch_id" uuid NOT NULL,
                "status" "registrations_status_enum" NOT NULL DEFAULT 'pending',
                "reference_code" character varying(50) NOT NULL,
                "checked_in_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_registrations" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_registrations_reference_code" UNIQUE ("reference_code")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_registrations_participant_id" ON "registrations" ("participant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_registrations_event_batch_id" ON "registrations" ("event_batch_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_registrations_status" ON "registrations" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_registrations_reference_code" ON "registrations" ("reference_code")`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_participant_id" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD CONSTRAINT "FK_registrations_event_batch_id" FOREIGN KEY ("event_batch_id") REFERENCES "event_batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Registrations Table
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_event_batch_id"`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "FK_registrations_participant_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registrations_reference_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registrations_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registrations_event_batch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registrations_participant_id"`);
        await queryRunner.query(`DROP TABLE "registrations"`);
        await queryRunner.query(`DROP TYPE "registrations_status_enum"`);

        // Drop Participants Table
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_participants_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_participants_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_participants_email"`);
        await queryRunner.query(`DROP TABLE "participants"`);

        // Drop Event Batches Table
        await queryRunner.query(`ALTER TABLE "event_batches" DROP CONSTRAINT "FK_event_batches_event_project_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_batches_start_time"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_event_batches_event_project_id"`);
        await queryRunner.query(`DROP TABLE "event_batches"`);
    }
}
