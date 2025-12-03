import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBatch } from '../entities/event-batch.entity';
import { EventProject } from '../entities/event-project.entity';

@Injectable()
export class EventBatchService {
    constructor(
        @InjectRepository(EventBatch)
        private readonly batchRepository: Repository<EventBatch>,
        @InjectRepository(EventProject)
        private readonly eventRepository: Repository<EventProject>,
    ) { }

    async createBatch(
        eventProjectId: string,
        data: Partial<EventBatch>,
    ): Promise<EventBatch> {
        const event = await this.eventRepository.findOne({ where: { id: eventProjectId } });
        if (!event) {
            throw new NotFoundException('Event project not found');
        }

        const batch = this.batchRepository.create({
            ...data,
            eventProjectId,
        });

        return await this.batchRepository.save(batch);
    }

    async updateBatch(
        batchId: string,
        data: Partial<EventBatch>,
    ): Promise<EventBatch> {
        const batch = await this.batchRepository.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new NotFoundException('Batch not found');
        }

        Object.assign(batch, data);
        return await this.batchRepository.save(batch);
    }

    async deleteBatch(batchId: string): Promise<void> {
        const batch = await this.batchRepository.findOne({
            where: { id: batchId },
            relations: ['registrations'],
        });

        if (!batch) {
            throw new NotFoundException('Batch not found');
        }

        if (batch.registrations && batch.registrations.length > 0) {
            throw new BadRequestException('Cannot delete batch with existing registrations');
        }

        await this.batchRepository.remove(batch);
    }

    async getBatchesByEvent(eventProjectId: string): Promise<EventBatch[]> {
        return await this.batchRepository.find({
            where: { eventProjectId },
            order: { startTime: 'ASC' },
        });
    }

    async getBatchById(batchId: string): Promise<EventBatch> {
        const batch = await this.batchRepository.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new NotFoundException('Batch not found');
        }
        return batch;
    }
}
