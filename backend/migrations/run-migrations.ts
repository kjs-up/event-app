#!/usr/bin/env ts-node

import 'reflect-metadata';
import { AppDataSource, initializeDataSource, closeDataSource } from '../src/database/data-source';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  try {
    console.log('🚀 Starting migration process...');

    // Initialize database connection
    console.log('📡 Connecting to database...');
    await initializeDataSource();

    // Check for pending migrations
    console.log('🔍 Checking for pending migrations...');
    const pendingMigrations = await AppDataSource.showMigrations();

    if (pendingMigrations) {
      console.log(`📋 Found ${pendingMigrations} pending migrations`);
      console.log('⚡ Running migrations...');

      await AppDataSource.runMigrations({
        transaction: 'all', // Run all migrations in a single transaction
      });

      console.log('✅ All migrations completed successfully');
    } else {
      console.log('✅ Database is up to date - no pending migrations');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  } finally {
    await closeDataSource();
    console.log('🔌 Database connection closed');
  }
}

async function revertLastMigration() {
  try {
    console.log('🔄 Reverting last migration...');

    await initializeDataSource();
    await AppDataSource.undoLastMigration({
      transaction: 'all',
    });

    console.log('✅ Last migration reverted successfully');

  } catch (error) {
    console.error('❌ Migration revert failed:', error);
    process.exit(1);
  } finally {
    await closeDataSource();
  }
}

async function showMigrationStatus() {
  try {
    console.log('📊 Checking migration status...\n');

    await initializeDataSource();

    // Get executed migrations
    const executedMigrations = await AppDataSource.query(`
      SELECT name, timestamp
      FROM typeorm_migrations
      ORDER BY timestamp DESC
    `);

    console.log('=== Migration Status ===\n');

    if (executedMigrations.length > 0) {
      console.log('✅ Executed migrations:');
      executedMigrations.forEach((migration: any) => {
        const date = new Date(migration.timestamp).toISOString();
        console.log(`  • ${migration.name} (${date})`);
      });
    } else {
      console.log('📝 No migrations have been executed yet');
    }

    // Check for pending migrations
    const pendingCount = await AppDataSource.showMigrations();
    console.log(`\n📋 Pending migrations: ${pendingCount || 0}\n`);

  } catch (error) {
    console.error('❌ Failed to show migration status:', error);
    process.exit(1);
  } finally {
    await closeDataSource();
  }
}

async function createMigration(name: string) {
  try {
    console.log(`📝 Creating new migration: ${name}`);

    await initializeDataSource();

    // Generate migration based on entity changes
    // Determine next version
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir);
    let maxVersion = 0;

    files.forEach(file => {
      const match = file.match(/^v(\d+)__/);
      if (match) {
        const version = parseInt(match[1]);
        if (version > maxVersion) maxVersion = version;
      }
    });

    const nextVersion = maxVersion + 1;
    const timestamp = Date.now();

    // Helper to convert to snake_case
    const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '').toLowerCase();

    // Helper to convert to PascalCase
    const toPascalCase = (str: string) => str.replace(/(^\w|_\w)/g, m => m.replace('_', '').toUpperCase());

    const snakeName = toSnakeCase(name);
    const pascalName = toPascalCase(name);

    const migrationName = `v${nextVersion}__${snakeName}_${timestamp}`;
    const className = `v${nextVersion}__${snakeName}_${timestamp}`;
    const nameProperty = `v${nextVersion}__${snakeName}_${timestamp}`;
    // Get SQL queries that would sync the schema
    const sqlInMemory = await AppDataSource.driver.createSchemaBuilder().log();

    if (sqlInMemory.upQueries.length === 0) {
      console.log('⚠️  No schema changes detected - nothing to migrate');
      return;
    }

    console.log('✅ Migration queries generated:');
    console.log('Up queries:', sqlInMemory.upQueries.length);
    console.log('Down queries:', sqlInMemory.downQueries.length);
    console.log('\n📌 Note: Use TypeORM CLI to generate migration files:');
    console.log(`   npm run typeorm migration:generate -- ./migrations/${migrationName}`);

  } catch (error) {
    console.error('❌ Failed to create migration:', error);
    process.exit(1);
  } finally {
    await closeDataSource();
  }
}

// Command line interface
const command = process.argv[2];
const migrationName = process.argv[3];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'revert':
    revertLastMigration();
    break;
  case 'status':
    showMigrationStatus();
    break;
  case 'create':
    if (!migrationName) {
      console.error('❌ Migration name is required');
      console.log('Usage: ts-node run-migrations.ts create <MigrationName>');
      process.exit(1);
    }
    createMigration(migrationName);
    break;
  default:
    console.log(`
🗃️  Event Platform Migration Tool

Usage: ts-node run-migrations.ts <command> [options]

Commands:
  run              Run all pending migrations
  revert           Revert the last migration
  status           Show current migration status
  create <name>    Create a new migration file

Examples:
  ts-node run-migrations.ts run
  ts-node run-migrations.ts revert
  ts-node run-migrations.ts status
  ts-node run-migrations.ts create AddEventTable

Environment:
  Make sure your .env file contains the correct database configuration.
`);
    process.exit(0);
}