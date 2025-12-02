import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Database Module
import { DatabaseModule } from './database/database.module';

// Authentication Module
import { AuthModule } from './auth/auth.module';

// Users Module
import { UsersModule } from './users/users.module';

// Events Module
import { EventsModule } from './events/events.module';

// Shared Modules
import { LoggerModule } from './shared/logger/logger.module';
import { CacheModule } from './cache/cache.module';

// Guards
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Filters
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

// Interceptors
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

// Middleware
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // Core infrastructure modules
    DatabaseModule,
    AuthModule,
    UsersModule,

    // Feature modules
    EventsModule,

    // Shared modules
    LoggerModule,
    CacheModule,
  ],

  providers: [
    // Global JWT authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Global response interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logging middleware to all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}