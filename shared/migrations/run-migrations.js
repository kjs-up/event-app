#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("./data-source");
async function runMigrations() {
    try {
        console.log("Initializing database connection...");
        await (0, data_source_1.initializeDataSource)();
        console.log("Running pending migrations...");
        const pendingMigrations = await data_source_1.AppDataSource.showMigrations();
        if (pendingMigrations) {
            console.log(`Found ${pendingMigrations} pending migrations`);
            await data_source_1.AppDataSource.runMigrations();
            console.log("✅ All migrations completed successfully");
        }
        else {
            console.log("✅ Database is up to date - no pending migrations");
        }
    }
    catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
    finally {
        await (0, data_source_1.closeDataSource)();
        console.log("Database connection closed");
    }
}
async function revertLastMigration() {
    try {
        console.log("Initializing database connection...");
        await (0, data_source_1.initializeDataSource)();
        console.log("Reverting last migration...");
        await data_source_1.AppDataSource.undoLastMigration();
        console.log("✅ Last migration reverted successfully");
    }
    catch (error) {
        console.error("❌ Migration revert failed:", error);
        process.exit(1);
    }
    finally {
        await (0, data_source_1.closeDataSource)();
        console.log("Database connection closed");
    }
}
async function showMigrationStatus() {
    try {
        console.log("Initializing database connection...");
        await (0, data_source_1.initializeDataSource)();
        console.log("\n=== Migration Status ===");
        const executedMigrations = await data_source_1.AppDataSource.query(`
            SELECT name, timestamp
            FROM typeorm_migrations
            ORDER BY timestamp DESC
        `);
        if (executedMigrations.length > 0) {
            console.log("Executed migrations:");
            executedMigrations.forEach((migration) => {
                console.log(`  ✅ ${migration.name} (${new Date(migration.timestamp).toISOString()})`);
            });
        }
        else {
            console.log("No migrations have been executed yet");
        }
        const pendingCount = await data_source_1.AppDataSource.showMigrations();
        console.log(`\nPending migrations: ${pendingCount}`);
    }
    catch (error) {
        console.error("❌ Failed to show migration status:", error);
        process.exit(1);
    }
    finally {
        await (0, data_source_1.closeDataSource)();
        console.log("Database connection closed");
    }
}
const command = process.argv[2];
switch (command) {
    case "run":
        runMigrations();
        break;
    case "revert":
        revertLastMigration();
        break;
    case "status":
        showMigrationStatus();
        break;
    default:
        console.log(`
Usage: ts-node run-migrations.ts <command>

Commands:
  run     - Run all pending migrations
  revert  - Revert the last migration
  status  - Show migration status

Examples:
  ts-node run-migrations.ts run
  ts-node run-migrations.ts revert
  ts-node run-migrations.ts status
`);
        process.exit(1);
}
//# sourceMappingURL=run-migrations.js.map