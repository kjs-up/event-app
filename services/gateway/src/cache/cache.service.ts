import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Utility methods for common patterns
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);

    if (value === null || value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }

    return value;
  }

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const value = await callback();
    await this.set(key, value, ttl);
    return value;
  }

  async forget(key: string): Promise<void> {
    await this.del(key);
  }

  async flush(): Promise<void> {
    await this.reset();
  }

  // Pattern-based operations
  async deleteByPattern(pattern: string): Promise<void> {
    // Note: This requires extending cache-manager or using Redis directly
    // For now, we'll implement a basic version
    // In production, you might want to use the RedisService for pattern-based operations
    console.warn('Pattern-based deletion not implemented in cache-manager. Use RedisService for advanced operations.');
  }

  // Session-related helper methods
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // User-specific caching
  async setUserCache(userId: string, key: string, data: any, ttl?: number): Promise<void> {
    await this.set(`user:${userId}:${key}`, data, ttl);
  }

  async getUserCache<T>(userId: string, key: string): Promise<T | null> {
    return await this.get<T>(`user:${userId}:${key}`);
  }

  async deleteUserCache(userId: string, key?: string): Promise<void> {
    if (key) {
      await this.del(`user:${userId}:${key}`);
    } else {
      // Delete all user-specific cache (requires pattern deletion)
      console.warn('Bulk user cache deletion not implemented. Specify key or use RedisService.');
    }
  }

  // Event-specific caching
  async setEventCache(eventId: string, key: string, data: any, ttl?: number): Promise<void> {
    await this.set(`event:${eventId}:${key}`, data, ttl);
  }

  async getEventCache<T>(eventId: string, key: string): Promise<T | null> {
    return await this.get<T>(`event:${eventId}:${key}`);
  }

  async deleteEventCache(eventId: string, key?: string): Promise<void> {
    if (key) {
      await this.del(`event:${eventId}:${key}`);
    } else {
      console.warn('Bulk event cache deletion not implemented. Specify key or use RedisService.');
    }
  }
}