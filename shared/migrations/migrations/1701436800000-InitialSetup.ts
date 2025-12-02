// @ts-nocheck
import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from "typeorm";

export class InitialSetup1701436800000 implements MigrationInterface {
    name = 'InitialSetup1701436800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Enable TimescaleDB extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS timescaledb`);

        // Enable citext extension for case-insensitive text
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);

        // Create ENUM types
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                    CREATE TYPE user_role_enum AS ENUM ('maker', 'approver', 'admin');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type_enum') THEN
                    CREATE TYPE event_type_enum AS ENUM ('training', 'seminar', 'concert', 'entertainment', 'foundation');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status_enum') THEN
                    CREATE TYPE event_status_enum AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'archived');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_status_enum') THEN
                    CREATE TYPE batch_status_enum AS ENUM ('upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_type_enum') THEN
                    CREATE TYPE registration_type_enum AS ENUM ('online', 'walk_in');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status_enum') THEN
                    CREATE TYPE registration_status_enum AS ENUM ('pending', 'confirmed', 'waitlisted', 'cancelled');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
                    CREATE TYPE payment_status_enum AS ENUM ('not_required', 'pending', 'paid', 'failed', 'refunded');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider_enum') THEN
                    CREATE TYPE payment_provider_enum AS ENUM ('stripe', 'paypal', 'promptpay', 'nets_qr');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
                    CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'qr_code', 'bank_transfer');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type_enum') THEN
                    CREATE TYPE report_type_enum AS ENUM ('attendance', 'financial', 'summary', 'analytics');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_format_enum') THEN
                    CREATE TYPE file_format_enum AS ENUM ('pdf', 'excel');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'generation_status_enum') THEN
                    CREATE TYPE generation_status_enum AS ENUM ('pending', 'completed', 'failed');
                END IF;
            END
            $$;
        `);

        // Create Users table
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "email",
                        type: "citext",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "password_hash",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "first_name",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "last_name",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "role",
                        type: "user_role_enum",
                        default: "'maker'",
                        isNullable: false,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "last_login",
                        type: "timestamp with time zone",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Create Foundation Templates table
        await queryRunner.createTable(
            new Table({
                name: "foundation_templates",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "event_type",
                        type: "event_type_enum",
                        isNullable: false,
                    },
                    {
                        name: "default_capacity",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "default_is_paid",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "default_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "default_has_speakers",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "configuration",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create Event Projects table
        await queryRunner.createTable(
            new Table({
                name: "event_projects",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "event_type",
                        type: "event_type_enum",
                        isNullable: false,
                    },
                    {
                        name: "foundation_template_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "max_capacity",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "is_paid",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "base_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "currency",
                        type: "varchar",
                        length: "3",
                        default: "'USD'",
                        isNullable: false,
                    },
                    {
                        name: "has_speakers",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "event_status_enum",
                        default: "'draft'",
                        isNullable: false,
                    },
                    {
                        name: "created_by",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "approved_by",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false,
                    },
                    {
                        name: "approved_at",
                        type: "timestamp with time zone",
                        isNullable: true,
                    },
                    {
                        name: "rejection_reason",
                        type: "text",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add constraint to check max capacity
        await queryRunner.query(`
            ALTER TABLE event_projects
            ADD CONSTRAINT chk_max_capacity_limit
            CHECK (max_capacity > 0 AND max_capacity <= 2000)
        `);

        // Create foreign key relationships for event_projects
        await queryRunner.createForeignKey("event_projects", new ForeignKey({
            columnNames: ["foundation_template_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "foundation_templates",
            onDelete: "SET NULL",
        }));

        await queryRunner.createForeignKey("event_projects", new ForeignKey({
            columnNames: ["created_by"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "RESTRICT",
        }));

        await queryRunner.createForeignKey("event_projects", new ForeignKey({
            columnNames: ["approved_by"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL",
        }));

        // Create indexes for performance
        await queryRunner.createIndex("users", new Index({
            name: "idx_users_email",
            columnNames: ["email"],
            isUnique: true,
        }));

        await queryRunner.createIndex("users", new Index({
            name: "idx_users_role_active",
            columnNames: ["role", "is_active"],
        }));

        await queryRunner.createIndex("event_projects", new Index({
            name: "idx_event_projects_status",
            columnNames: ["status"],
        }));

        await queryRunner.createIndex("event_projects", new Index({
            name: "idx_event_projects_type_status",
            columnNames: ["event_type", "status"],
        }));

        await queryRunner.createIndex("event_projects", new Index({
            name: "idx_event_projects_created_by",
            columnNames: ["created_by"],
        }));

        // Create updated_at trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create triggers for updated_at
        await queryRunner.query(`
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_foundation_templates_updated_at
            BEFORE UPDATE ON foundation_templates
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_event_projects_updated_at
            BEFORE UPDATE ON event_projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log("Initial database setup completed successfully");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_event_projects_updated_at ON event_projects`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_foundation_templates_updated_at ON foundation_templates`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);

        // Drop function
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

        // Drop tables (in reverse order due to foreign keys)
        await queryRunner.dropTable("event_projects", true);
        await queryRunner.dropTable("foundation_templates", true);
        await queryRunner.dropTable("users", true);

        // Drop ENUM types
        await queryRunner.query(`DROP TYPE IF EXISTS generation_status_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS file_format_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS report_type_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_provider_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS registration_status_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS registration_type_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS batch_status_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS event_status_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS event_type_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);

        console.log("Initial database setup rolled back successfully");
    }
}