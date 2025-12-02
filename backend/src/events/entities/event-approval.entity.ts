import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EventProject } from './event-project.entity';

export enum ApprovalAction {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('event_approvals')
@Index(['eventProjectId', 'createdAt'])
@Index(['approverId', 'status'])
@Index(['status', 'action'])
export class EventApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_project_id', type: 'uuid' })
  eventProjectId: string;

  @Column({ name: 'approver_id', type: 'uuid', nullable: true })
  approverId: string;

  @Column({ name: 'submitted_by', type: 'uuid' })
  submittedBy: string;

  @Column({
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
    comment: 'Additional approval metadata and context'
  })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => EventProject, eventProject => eventProject.approvals, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'event_project_id' })
  eventProject: EventProject;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'submitted_by' })
  submitter: User;

  // Virtual properties
  get isApproved(): boolean {
    return this.action === ApprovalAction.APPROVED && this.status === ApprovalStatus.COMPLETED;
  }

  get isRejected(): boolean {
    return this.action === ApprovalAction.REJECTED && this.status === ApprovalStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === ApprovalStatus.PENDING;
  }

  get isExpired(): boolean {
    return this.expiresAt && new Date() > this.expiresAt;
  }

  get isRevisionRequested(): boolean {
    return this.action === ApprovalAction.REVISION_REQUESTED && this.status === ApprovalStatus.COMPLETED;
  }

  get timeToExpiration(): number | null {
    if (!this.expiresAt) return null;
    return this.expiresAt.getTime() - new Date().getTime();
  }

  // Business logic methods
  approve(approverId: string, comments?: string): void {
    this.approverId = approverId;
    this.action = ApprovalAction.APPROVED;
    this.status = ApprovalStatus.COMPLETED;
    this.comments = comments;
    this.approvedAt = new Date();
    this.rejectedAt = null;
    this.rejectionReason = null;
  }

  reject(approverId: string, rejectionReason: string, comments?: string): void {
    this.approverId = approverId;
    this.action = ApprovalAction.REJECTED;
    this.status = ApprovalStatus.COMPLETED;
    this.rejectionReason = rejectionReason;
    this.comments = comments;
    this.rejectedAt = new Date();
    this.approvedAt = null;
  }

  requestRevision(approverId: string, comments: string): void {
    this.approverId = approverId;
    this.action = ApprovalAction.REVISION_REQUESTED;
    this.status = ApprovalStatus.COMPLETED;
    this.comments = comments;
    this.rejectionReason = null;
    this.approvedAt = null;
    this.rejectedAt = null;
  }

  cancel(): void {
    this.status = ApprovalStatus.CANCELLED;
  }

  // Validation methods
  validateApprovalAction(userId: string): boolean {
    if (this.status !== ApprovalStatus.PENDING) {
      return false;
    }

    if (this.isExpired) {
      return false;
    }

    // Approver can't approve their own submission
    return this.submittedBy !== userId;
  }

  // Utility methods
  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata<T>(key: string, defaultValue?: T): T | undefined {
    return this.metadata?.[key] ?? defaultValue;
  }

  calculateExpirationDate(daysFromNow: number = 7): Date {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);
    return expirationDate;
  }
}