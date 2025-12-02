# Database Migrations

This package contains the database migration system for the Event Management Platform using TypeORM.

## Overview

The migration system is centralized in the `shared/migrations` package and is used by all services that need database access. It uses PostgreSQL with TimescaleDB extension for time-series data.

## Structure

```
shared/migrations/
├── data-source.ts          # TypeORM DataSource configuration
├── run-migrations.ts       # Migration runner script
├── migrations/             # Migration files
│   └── 1701436800000-InitialSetup.ts
└── package.json
```

## Setup

1. **Environment Configuration**: Ensure your environment variables are set in `.env.local` or `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=eventuser
DATABASE_PASSWORD=eventpass
DATABASE_NAME=eventdb
DATABASE_SCHEMA=public
```

2. **Install Dependencies**:

```bash
cd shared/migrations
pnpm install
```

## Usage

### Running Migrations

```bash
# Run all pending migrations
pnpm migration:run
# or
ts-node run-migrations.ts run

# Check migration status
ts-node run-migrations.ts status
```

### Creating New Migrations

```bash
# Generate migration from entity changes
pnpm migration:generate -- -n MigrationName

# Create empty migration
pnpm migration:create -- MigrationName
```

### Reverting Migrations

```bash
# Revert the last migration
pnpm migration:revert
# or
ts-node run-migrations.ts revert
```

## Migration Files

### Initial Setup (1701436800000-InitialSetup.ts)

This migration creates the foundational database structure including:

- **Extensions**: UUID, TimescaleDB, citext
- **Enums**: All application enums for type safety
- **Core Tables**:
  - `users` - System users with role-based access
  - `foundation_templates` - Reusable event templates
  - `event_projects` - Main event entities
- **Constraints**: Business logic constraints (e.g., max capacity 2000)
- **Indexes**: Performance-optimized indexes
- **Triggers**: Automatic updated_at timestamps

## Database Schema Features

### TimescaleDB Integration

- TimescaleDB extension enabled for time-series analytics
- Prepared for hypertables for metrics data

### Security Features

- citext extension for case-insensitive email handling
- Password hash storage (never plain text)
- Foreign key constraints with appropriate cascade rules

### Performance Optimizations

- Strategic indexing on frequently queried columns
- Partial indexes for filtered queries
- JSONB for flexible configuration storage

### Data Integrity

- Check constraints for business rules
- NOT NULL constraints for required fields
- Foreign key relationships with proper referential integrity

## Best Practices

1. **Never modify existing migrations** - Always create new ones
2. **Test migrations thoroughly** on development data first
3. **Use descriptive names** for migrations
4. **Include both up and down methods** for reversibility
5. **Add appropriate indexes** for performance
6. **Document complex migrations** with comments

## Troubleshooting

### Connection Issues

```bash
# Check database is running
docker ps | grep postgres

# Test connection
psql postgresql://eventuser:eventpass@localhost:5432/eventdb -c "SELECT version();"
```

### Migration Failures

```bash
# Check migration status
ts-node run-migrations.ts status

# Check database logs
docker logs event-platform-postgres

# Manual rollback if needed
ts-node run-migrations.ts revert
```

### TypeORM CLI Issues

Ensure you have the correct TypeORM CLI installed:

```bash
npm install -g typeorm
# or use local version
npx typeorm
```

## Integration with Services

Each service that needs database access should:

1. Import the shared DataSource configuration
2. Use the same entity definitions from `@event-platform/types`
3. Run migrations through the shared migration system

Example service integration:

```typescript
import { AppDataSource } from '@event-platform/migrations/data-source';
import { User } from '@event-platform/types/entities/User';

// In your service initialization
await AppDataSource.initialize();

// Use repositories
const userRepository = AppDataSource.getRepository(User);
```

This centralized approach ensures consistent database schema across all microservices while maintaining TypeORM's powerful migration capabilities.