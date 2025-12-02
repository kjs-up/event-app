import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FoundationTemplate } from './foundation-template.entity';
import { EventApproval } from './event-approval.entity';

import { EventType, EventStatus } from '../enums/event.enums';

@Entity('event_projects')
@Index(['status', 'createdAt'])
@Index(['eventType', 'status'])
export class EventProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column({ name: 'foundation_template_id', type: 'uuid', nullable: true })
  foundationTemplateId: string;

  @Column({ name: 'max_capacity', type: 'int' })
  maxCapacity: number;

  @Column({ name: 'is_paid', type: 'boolean' })
  isPaid: boolean;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'has_speakers', type: 'boolean' })
  hasSpeakers: boolean;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @ManyToOne(() => FoundationTemplate, { nullable: true })
  @JoinColumn({ name: 'foundation_template_id' })
  foundationTemplate: FoundationTemplate;

  @OneToMany(() => EventApproval, approval => approval.eventProject)
  approvals: EventApproval[];

  // Virtual properties
  get fullName(): string {
    return `${this.name} (${this.eventType})`;
  }

  get isApproved(): boolean {
    return this.status === EventStatus.APPROVED;
  }

  get isPending(): boolean {
    return this.status === EventStatus.PENDING_APPROVAL;
  }

  get canBeModified(): boolean {
    return this.status === EventStatus.DRAFT || this.status === EventStatus.REJECTED;
  }

  // Validation methods
  validateStateTransition(newStatus: EventStatus): boolean {
    const validTransitions: Record<EventStatus, EventStatus[]> = {
      [EventStatus.DRAFT]: [EventStatus.PENDING_APPROVAL],
      [EventStatus.PENDING_APPROVAL]: [EventStatus.APPROVED, EventStatus.REJECTED],
      [EventStatus.APPROVED]: [EventStatus.ARCHIVED],
      [EventStatus.REJECTED]: [EventStatus.DRAFT],
      [EventStatus.ARCHIVED]: [],
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  validateCapacity(): boolean {
    return this.maxCapacity > 0 && this.maxCapacity <= 2000;
  }

  validatePaidEvent(): boolean {
    if (!this.isPaid) return true;
    return this.basePrice !== null && this.basePrice > 0;
  }
}