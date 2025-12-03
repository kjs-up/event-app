import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EventProject } from './event-project.entity';
import { Registration } from '../../registration/entities/registration.entity';

@Entity('event_batches')
export class EventBatch {
    @ApiProperty({ description: 'Batch UUID' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Event Project ID' })
    @Column({ name: 'event_project_id' })
    eventProjectId: string;

    @ApiProperty({ description: 'Batch name (e.g., Round 1, Morning Session)' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Start time of the batch' })
    @Column({ type: 'timestamp' })
    startTime: Date;

    @ApiProperty({ description: 'End time of the batch' })
    @Column({ type: 'timestamp' })
    endTime: Date;

    @ApiProperty({ description: 'Maximum capacity for this batch' })
    @Column({ type: 'int' })
    capacity: number;

    @ApiProperty({ description: 'Current number of registrations' })
    @Column({ type: 'int', default: 0 })
    currentRegistrations: number;

    @ApiProperty({ description: 'Is this batch available for registration?' })
    @Column({ default: true })
    isAvailable: boolean;

    @ApiProperty({ description: 'Price for this batch (if different from base event price)' })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => EventProject, (event) => event.batches)
    @JoinColumn({ name: 'event_project_id' })
    eventProject: EventProject;

    @OneToMany(() => Registration, (registration) => registration.eventBatch)
    registrations: Registration[];
}
