import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    const commonOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    };

    if (redisUrl) {
      this.client = new Redis(redisUrl, commonOptions);
    } else {
      this.client = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        db: redisDb,
        ...commonOptions,
      });
    }

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this.client.on('close', () => {
      console.log('Redis client disconnected');
    });

    if (this.client.status === 'wait' || this.client.status === 'close') {
      await this.client.connect();
    }
  }

  private async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  // List operations
  async lpush(key: string, value: string): Promise<number> {
    return await this.client.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<number> {
    return await this.client.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return await this.client.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    return await this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.client.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number, withScores?: boolean): Promise<string[]> {
    if (withScores) {
      return await this.client.zrange(key, start, stop, 'WITHSCORES');
    }
    return await this.client.zrange(key, start, stop);
  }

  async zrem(key: string, member: string): Promise<number> {
    return await this.client.zrem(key, member);
  }

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    return await this.client.del(...keys);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  // Lock operations (simple implementation)
  async acquireLock(lockKey: string, timeout: number = 10): Promise<boolean> {
    const result = await this.client.set(lockKey, '1', 'PX', timeout * 1000, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.client.del(lockKey);
  }

  // Atomic counter operations
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return await this.client.incrby(key, increment);
  }

  // Pipeline operations
  async pipeline(commands: Array<[string, ...any[]]>): Promise<any[]> {
    const pipeline = this.client.pipeline();
    commands.forEach(([command, ...args]) => {
      (pipeline as any)[command](...args);
    });
    const results = await pipeline.exec();
    return results?.map(([error, result]) => {
      if (error) throw error;
      return result;
    }) || [];
  }

  // Health check
  async ping(): Promise<string> {
    return await this.client.ping();
  }
}