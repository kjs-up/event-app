import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBatch } from '../entities/event-batch.entity';

@Injectable()
export class CapacityService {
    private readonly logger = new Logger(CapacityService.name);
    private readonly TTL = 60 * 60 * 24; // 24 hours

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(EventBatch)
        private readonly batchRepository: Repository<EventBatch>,
    ) { }

    private getCapacityKey(batchId: string): string {
        return `batch:${batchId}:capacity`;
    }

    private getRegistrationsKey(batchId: string): string {
        return `batch:${batchId}:registrations`;
    }

    async initializeCapacity(batchId: string, capacity: number, currentRegistrations: number): Promise<void> {
        await this.cacheManager.set(this.getCapacityKey(batchId), capacity, this.TTL);
        await this.cacheManager.set(this.getRegistrationsKey(batchId), currentRegistrations, this.TTL);
    }

    async checkAvailability(batchId: string): Promise<boolean> {
        let capacity = await this.cacheManager.get<number>(this.getCapacityKey(batchId));
        let registrations = await this.cacheManager.get<number>(this.getRegistrationsKey(batchId));

        if (capacity === undefined || registrations === undefined) {
            // Fallback to DB if cache miss
            const batch = await this.batchRepository.findOne({ where: { id: batchId } });
            if (!batch) return false;

            capacity = batch.capacity;
            registrations = batch.currentRegistrations;
            await this.initializeCapacity(batchId, capacity, registrations);
        }

        return registrations < capacity;
    }

    async reserveSpot(batchId: string): Promise<boolean> {
        const capacityKey = this.getCapacityKey(batchId);
        const registrationsKey = this.getRegistrationsKey(batchId);

        // Simple optimistic locking using Redis atomic increment could be better, 
        // but for now we use a check-then-act with cache manager.
        // In a high-concurrency production env, use Lua scripts or Redis native INCR/DECR with checks.

        const capacity = await this.cacheManager.get<number>(capacityKey);
        let registrations = await this.cacheManager.get<number>(registrationsKey);

        if (capacity === undefined || registrations === undefined) {
            const batch = await this.batchRepository.findOne({ where: { id: batchId } });
            if (!batch) return false;
            await this.initializeCapacity(batchId, batch.capacity, batch.currentRegistrations);
            registrations = batch.currentRegistrations;
        }

        if (registrations >= capacity) {
            return false;
        }

        // Increment registrations
        // Note: This is not strictly atomic with cache-manager without a proper backend store that supports it directly via this API.
        // Ideally use redisStore.client.incr() if available.
        await this.cacheManager.set(registrationsKey, registrations + 1, this.TTL);
        return true;
    }

    async releaseSpot(batchId: string): Promise<void> {
        const registrationsKey = this.getRegistrationsKey(batchId);
        let registrations = await this.cacheManager.get<number>(registrationsKey);

        if (registrations !== undefined && registrations > 0) {
            await this.cacheManager.set(registrationsKey, registrations - 1, this.TTL);
        }
    }

    async syncFromDatabase(batchId: string): Promise<void> {
        const batch = await this.batchRepository.findOne({ where: { id: batchId } });
        if (batch) {
            await this.initializeCapacity(batchId, batch.capacity, batch.currentRegistrations);
        }
    }
}
