import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST', 'localhost'),
      port: this.configService.get('DATABASE_PORT', 5432),
      username: this.configService.get('DATABASE_USERNAME', 'eventuser'),
      password: this.configService.get('DATABASE_PASSWORD', 'eventpass'),
      database: this.configService.get('DATABASE_NAME', 'eventdb'),
      schema: this.configService.get('DATABASE_SCHEMA', 'public'),

      // Entity Configuration
      entities: [
        join(__dirname, '../**/*.entity{.ts,.js}'),
        join(__dirname, '../../../shared/types/entities/**/*.entity{.ts,.js}'),
      ],

      // Migration Configuration
      migrations: [
        join(__dirname, '../migrations/*{.ts,.js}'),
        join(__dirname, '../../../shared/migrations/migrations/*{.ts,.js}'),
      ],

      // Subscriber Configuration
      subscribers: [
        join(__dirname, '../**/*.subscriber{.ts,.js}'),
      ],

      // Development vs Production Settings
      synchronize: this.configService.get('DATABASE_SYNCHRONIZE', false),
      logging: this.configService.get('DATABASE_LOGGING', !isProduction),
      autoLoadEntities: this.configService.get('DATABASE_AUTO_LOAD_ENTITIES', true),

      // Connection Pool Configuration
      extra: {
        max: this.configService.get('DATABASE_POOL_MAX', 10),
        min: this.configService.get('DATABASE_POOL_MIN', 2),
        connectionTimeoutMillis: this.configService.get('DATABASE_CONNECTION_TIMEOUT', 30000),
        idleTimeoutMillis: this.configService.get('DATABASE_IDLE_TIMEOUT', 60000),
      },

      // SSL Configuration for Production
      ssl: isProduction ? {
        rejectUnauthorized: false,
      } : false,

      // Connection Retry Configuration
      retryAttempts: 5,
      retryDelay: 3000,

      // Migration Configuration
      migrationsRun: false, // Migrations should be run manually
      migrationsTableName: 'typeorm_migrations',

      // Connection Name (for multi-database setups)
      name: 'default',
    };
  }

  /**
   * Get database URL for CLI operations
   */
  getDatabaseUrl(): string {
    const host = this.configService.get('DATABASE_HOST', 'localhost');
    const port = this.configService.get('DATABASE_PORT', 5432);
    const username = this.configService.get('DATABASE_USERNAME', 'eventuser');
    const password = this.configService.get('DATABASE_PASSWORD', 'eventpass');
    const database = this.configService.get('DATABASE_NAME', 'eventdb');

    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  /**
   * Validate database configuration
   */
  validateConfig(): void {
    const requiredVars = [
      'DATABASE_HOST',
      'DATABASE_PORT',
      'DATABASE_USERNAME',
      'DATABASE_PASSWORD',
      'DATABASE_NAME',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName)
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required database configuration variables: ${missingVars.join(', ')}`
      );
    }
  }
}