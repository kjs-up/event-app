# Database Migrations - Gateway Service

This directory contains database migrations for the Gateway service of the Event Management Platform.

## Overview

The migration system uses TypeORM to manage database schema changes and ensures consistent database structure across environments.

## Directory Structure

```
migrations/
├── run-migrations.ts           # Migration runner CLI tool
├── 1701436800001-CreateUsersTable.ts    # Initial user table migration
└── README.md                   # This file
```

## Usage

### Prerequisites

1. Ensure your `.env` file is configured with correct database settings
2. Make sure PostgreSQL with TimescaleDB is running
3. Install dependencies: `pnpm install`

### Running Migrations

```bash
# Run all pending migrations
ts-node migrations/run-migrations.ts run

# Check migration status
ts-node migrations/run-migrations.ts status

# Revert the last migration
ts-node migrations/run-migrations.ts revert

# Create a new migration
ts-node migrations/run-migrations.ts create AddEventTable
```

### Package.json Scripts

You can also use the npm scripts defined in package.json:

```bash
# Run migrations
pnpm migrate:run

# Revert last migration
pnpm migrate:rollback

# Generate migration from entity changes
pnpm migration:generate -- -n MigrationName

# Create empty migration
pnpm migration:create -- MigrationName
```

## Migration Files

### 1701436800001-CreateUsersTable.ts

Creates the foundational users table with:

- **UUID primary key** with automatic generation
- **Email field** with unique constraint (case-insensitive)
- **Password hash** storage (never store plain text passwords)
- **User roles** (maker, approver, admin) using PostgreSQL ENUM
- **Soft delete** support with deleted_at field
- **Audit fields** (created_at, updated_at, last_login)
- **Automatic timestamps** with triggers
- **Performance indexes** on frequently queried fields
- **Default admin user** for system initialization

## Best Practices

1. **Never edit existing migrations** - Always create new ones for changes
2. **Test migrations** on a copy of production data before deploying
3. **Use descriptive names** that clearly indicate the change
4. **Include rollback logic** in the `down()` method
5. **Backup database** before running migrations in production
6. **Review generated migrations** before committing

## Database Schema Features

### User Management

- **Role-based access control** with enum constraints
- **Email verification** tracking
- **Soft delete** capability for data retention
- **Automatic password hash** validation (never store plain text)

### Performance Optimizations

- **Strategic indexes** on email (unique), role + active status
- **Partial indexes** for soft-deleted records
- **Automatic updated_at** timestamps via database triggers

### Security Features

- **Case-insensitive email** handling with citext extension
- **UUID primary keys** to prevent enumeration attacks
- **Soft delete** preserves audit trail
- **Default admin user** with secure password hash

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql postgresql://eventuser:eventpass@localhost:5432/eventdb -c "SELECT version();"

# Check if services are running
docker ps | grep postgres
```

### Migration Failures

```bash
# Check current migration status
ts-node migrations/run-migrations.ts status

# View database logs
docker logs event-platform-postgres

# Check for schema conflicts
psql eventdb -c "SELECT * FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 5;"
```

### Common Issues

1. **Permission denied**: Ensure database user has sufficient privileges
2. **Type already exists**: Usually indicates a previous migration failed partway
3. **Connection timeout**: Check network connectivity and database status

## Integration with Application

The migrations integrate with the main application through:

1. **DatabaseModule**: Configures TypeORM with migration settings
2. **Entity definitions**: Located in `src/entities/` directory
3. **Data source configuration**: Shared configuration in `src/database/data-source.ts`

### Running in Production

```bash
# Production migration workflow
1. Backup database
2. Run migrations with transaction support
3. Verify schema integrity
4. Test application functionality
5. Monitor for issues

# Example production command
NODE_ENV=production ts-node migrations/run-migrations.ts run
```

This migration system provides a solid foundation for database schema management and ensures data integrity across all environments.