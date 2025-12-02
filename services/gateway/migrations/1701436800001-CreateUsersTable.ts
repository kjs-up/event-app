import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateUsersTable1701436800001 implements MigrationInterface {
  name = 'CreateUsersTable1701436800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types if they don't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE user_role_enum AS ENUM ('maker', 'approver', 'admin');
        END IF;
      END
      $$;
    `);

    // Create Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'citext',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'user_role_enum',
            default: "'maker'",
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'last_login',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'idx_users_role_active',
        columnNames: ['role', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'idx_users_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create updated_at trigger
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Insert default admin user (password: Admin123!)
    await queryRunner.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
      VALUES (
        'admin@eventplatform.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VDmS6bMoy', -- Admin123!
        'System',
        'Administrator',
        'admin',
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop table
    await queryRunner.dropTable('users', true);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}