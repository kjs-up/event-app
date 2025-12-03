import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Participant } from '@/registration/entities/participant.entity';
import { EventBatch } from '../../events/entities/event-batch.entity';

export enum RegistrationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    WAITLISTED = 'waitlisted',
    CHECKED_IN = 'checked_in',
}

@Entity('registrations')
export class Registration {
    @ApiProperty({ description: 'Registration UUID' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Participant ID' })
    @Column({ name: 'participant_id' })
    participantId: string;

    @ApiProperty({ description: 'Event Batch ID' })
    @Column({ name: 'event_batch_id' })
    eventBatchId: string;

    @ApiProperty({ description: 'Registration Status', enum: RegistrationStatus })
    @Column({
        type: 'enum',
        enum: RegistrationStatus,
        default: RegistrationStatus.PENDING,
    })
    status: RegistrationStatus;

    @ApiProperty({ description: 'Unique Reference Code' })
    @Column({ unique: true })
    referenceCode: string;

    @ApiProperty({ description: 'Check-in Timestamp' })
    @Column({ type: 'timestamp', nullable: true })
    checkedInAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Participant, (participant) => participant.registrations)
    @JoinColumn({ name: 'participant_id' })
    participant: Participant;

    @ManyToOne(() => EventBatch, (batch) => batch.registrations)
    @JoinColumn({ name: 'event_batch_id' })
    eventBatch: EventBatch;
}
