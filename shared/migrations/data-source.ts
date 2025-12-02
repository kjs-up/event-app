import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as path from "path";

// Load environment variables
config({ path: path.resolve(__dirname, "../../.env.local") });
config({ path: path.resolve(__dirname, "../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USERNAME || "eventuser",
  password: process.env.DATABASE_PASSWORD || "eventpass",
  database: process.env.DATABASE_NAME || "eventdb",
  schema: process.env.DATABASE_SCHEMA || "public",
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  entities: [
    path.join(__dirname, "../types/entities/**/*.{ts,js}"),
  ],
  migrations: [
    path.join(__dirname, "migrations/**/*.{ts,js}"),
  ],
  subscribers: [
    path.join(__dirname, "subscribers/**/*.{ts,js}"),
  ],
  // PostgreSQL specific options
  extra: {
    max: parseInt(process.env.DATABASE_POOL_MAX || "10"),
    min: parseInt(process.env.DATABASE_POOL_MIN || "2"),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "30000"),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "60000"),
  },
  // SSL configuration for production
  ssl: process.env.NODE_ENV === "production" ? {
    rejectUnauthorized: false
  } : false,
});

// Initialize the data source
export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized successfully");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during Data Source initialization", error);
    throw error;
  }
};

// Graceful shutdown
export const closeDataSource = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed successfully");
    }
  } catch (error) {
    console.error("Error during Data Source closing", error);
    throw error;
  }
};