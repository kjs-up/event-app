import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../entities/participant.entity';

@Injectable()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
    ) { }

    async createOrUpdateParticipant(data: Partial<Participant>): Promise<Participant> {
        let participant: Participant | null = null;

        if (data.email) {
            participant = await this.participantRepository.findOne({ where: { email: data.email } });
        }

        if (participant) {
            // Update existing participant
            Object.assign(participant, data);
            return await this.participantRepository.save(participant);
        }

        // Create new participant
        participant = this.participantRepository.create(data);
        return await this.participantRepository.save(participant);
    }

    async getParticipantByEmail(email: string): Promise<Participant | null> {
        return await this.participantRepository.findOne({ where: { email } });
    }

    async getParticipantById(id: string): Promise<Participant> {
        const participant = await this.participantRepository.findOne({ where: { id } });
        if (!participant) {
            throw new NotFoundException('Participant not found');
        }
        return participant;
    }
}
