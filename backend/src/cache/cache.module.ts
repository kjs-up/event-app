import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

import { CacheService } from './cache.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    NestCacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisDb = configService.get<number>('REDIS_DB', 0);

        return {
          store: redisStore as any,
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          db: redisDb,
          ttl: 300, // Default TTL of 5 minutes
          max: 1000, // Maximum number of cached items
          // Connection options
          socket: {
            connectTimeout: 60000,
            lazyConnect: true,
          },
          // Retry strategy
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          // Health check
          enableReadyCheck: true,
          lazyConnect: true,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheService, RedisService],
  exports: [CacheService, RedisService, NestCacheModule],
})
export class CacheModule {}