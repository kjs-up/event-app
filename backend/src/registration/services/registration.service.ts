import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from '../entities/registration.entity';
import { EventBatch } from '../../events/entities/event-batch.entity';
import { ParticipantService } from './participant.service';
import { Participant } from '../entities/participant.entity';
import { CapacityGateway } from '../../gateway/capacity.gateway';
import { CapacityService } from '../../events/services/capacity.service';
import { RegistrationNotificationService } from '../../notifications/registration-notification.service';

@Injectable()
export class RegistrationService {
    constructor(
        @InjectRepository(Registration)
        private readonly registrationRepository: Repository<Registration>,
        @InjectRepository(EventBatch)
        private readonly batchRepository: Repository<EventBatch>,
        private readonly participantService: ParticipantService,
        private readonly capacityGateway: CapacityGateway,
        private readonly capacityService: CapacityService,
        private readonly notificationService: RegistrationNotificationService,
    ) { }

    async register(
        batchId: string,
        participantData: Partial<Participant>,
    ): Promise<Registration> {
        const batch = await this.batchRepository.findOne({ where: { id: batchId }, relations: ['eventProject'] });
        if (!batch) {
            throw new NotFoundException('Event batch not found');
        }

        if (!batch.isAvailable) {
            throw new BadRequestException('This batch is not available for registration');
        }

        // Check capacity using Redis-backed service
        const hasSpot = await this.capacityService.reserveSpot(batchId);
        if (!hasSpot) {
            throw new BadRequestException('This batch is fully booked');
        }

        try {
            // Create or update participant
            const participant = await this.participantService.createOrUpdateParticipant(participantData);

            // Check if already registered
            const existingRegistration = await this.registrationRepository.findOne({
                where: {
                    participantId: participant.id,
                    eventBatchId: batchId,
                    status: RegistrationStatus.CONFIRMED,
                },
            });

            if (existingRegistration) {
                // Release spot if duplicate registration
                await this.capacityService.releaseSpot(batchId);
                throw new ConflictException('Participant is already registered for this batch');
            }

            // Create registration
            const registration = this.registrationRepository.create({
                participantId: participant.id,
                eventBatchId: batchId,
                status: RegistrationStatus.CONFIRMED, // Auto-confirm for now
                referenceCode: this.generateReferenceCode(),
            });

            const savedRegistration = await this.registrationRepository.save(registration);

            // Update batch capacity in DB (eventually consistent with Redis)
            await this.batchRepository.increment({ id: batchId }, 'currentRegistrations', 1);

            // Emit capacity update
            // We fetch the latest from Redis or DB to be accurate
            // For simplicity, we can just increment what we have or re-fetch
            // But let's use the values from the batch object + 1 for now as a simple approximation
            // Ideally, CapacityService should return the new count
            this.capacityGateway.updateCapacity(
                batchId,
                batch.capacity,
                batch.currentRegistrations + 1,
            );

            // Send confirmation email
            // We need to attach relations for the email template
            savedRegistration.participant = participant;
            savedRegistration.eventBatch = batch;
            await this.notificationService.sendRegistrationConfirmation(savedRegistration);

            return savedRegistration;

        } catch (error) {
            // If anything fails after reserving a spot, we should try to release it
            // (except if it was a duplicate registration where we already released it)
            if (!(error instanceof ConflictException)) {
                await this.capacityService.releaseSpot(batchId);
            }
            throw error;
        }
    }

    async getRegistrationByReference(referenceCode: string): Promise<Registration> {
        const registration = await this.registrationRepository.findOne({
            where: { referenceCode },
            relations: ['participant', 'eventBatch', 'eventBatch.eventProject'],
        });

        if (!registration) {
            throw new NotFoundException('Registration not found');
        }

        return registration;
    }

    private generateReferenceCode(): string {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}
