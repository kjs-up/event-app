import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env') });
config({ path: join(process.cwd(), '.env.local') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'eventuser',
  password: process.env.DATABASE_PASSWORD || 'eventpass',
  database: process.env.DATABASE_NAME || 'eventdb',
  schema: process.env.DATABASE_SCHEMA || 'public',

  // Entity Configuration
  entities: [
    join(process.cwd(), 'src/**/*.entity{.ts,.js}'),
    join(process.cwd(), '../shared/types/entities/**/*.entity{.ts,.js}'),
  ],

  // Migration Configuration
  migrations: [
    join(process.cwd(), 'migrations/{[0-9]*,v[0-9]*}*{.ts,.js}'),
  ],

  // Subscriber Configuration
  subscribers: [
    join(process.cwd(), 'src/**/*.subscriber{.ts,.js}'),
  ],

  // Development Settings
  synchronize: false, // Never use in production
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],

  // Connection Pool Settings
  extra: {
    max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
    min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000'),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '60000'),
  },

  // SSL Configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,

  // Migration Settings
  migrationsTableName: 'typeorm_migrations',
});

// Initialize data source
export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection initialized successfully');
    }
    return AppDataSource;
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    throw error;
  }
};

// Close data source
export const closeDataSource = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed successfully');
    }
  } catch (error) {
    console.error('Error during Data Source closing:', error);
    throw error;
  }
};