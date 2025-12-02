import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventProject, EventType } from './event-project.entity';

@Entity('foundation_templates')
@Index(['eventType', 'isActive'])
@Index(['isActive', 'createdAt'])
export class FoundationTemplate {
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

  @Column({ name: 'default_capacity', type: 'int' })
  defaultCapacity: number;

  @Column({ name: 'default_is_paid', type: 'boolean' })
  defaultIsPaid: boolean;

  @Column({
    name: 'default_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  defaultPrice: number;

  @Column({ name: 'default_has_speakers', type: 'boolean' })
  defaultHasSpeakers: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional template configuration settings'
  })
  configuration: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => EventProject, eventProject => eventProject.foundationTemplate)
  eventProjects: EventProject[];

  // Virtual properties
  get displayName(): string {
    return `${this.name} (${this.eventType})`;
  }

  // Utility methods
  applyToEventProject(eventProject: Partial<EventProject>): Partial<EventProject> {
    return {
      ...eventProject,
      eventType: this.eventType,
      maxCapacity: eventProject.maxCapacity ?? this.defaultCapacity,
      isPaid: eventProject.isPaid ?? this.defaultIsPaid,
      basePrice: eventProject.basePrice ?? this.defaultPrice,
      hasSpeakers: eventProject.hasSpeakers ?? this.defaultHasSpeakers,
      foundationTemplateId: this.id,
    };
  }

  // Validation methods
  validateConfiguration(): boolean {
    if (this.defaultCapacity <= 0 || this.defaultCapacity > 2000) {
      return false;
    }

    if (this.defaultIsPaid && (!this.defaultPrice || this.defaultPrice <= 0)) {
      return false;
    }

    return true;
  }

  // Template configuration helpers
  getConfigurationValue<T>(key: string, defaultValue?: T): T | undefined {
    return this.configuration?.[key] ?? defaultValue;
  }

  setConfigurationValue(key: string, value: any): void {
    if (!this.configuration) {
      this.configuration = {};
    }
    this.configuration[key] = value;
  }
}