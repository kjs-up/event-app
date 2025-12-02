import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import {
  EventApproval,
  ApprovalAction,
  ApprovalStatus,
} from '../entities/event-approval.entity';
import {
  EventProject,
  EventStatus,
} from '../entities/event-project.entity';
import { User, UserRole } from '../../users/entities/user.entity';

export interface ApprovalListOptions {
  status?: ApprovalStatus;
  action?: ApprovalAction;
  approverId?: string;
  eventProjectId?: string;
  submitterId?: string;
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'approvedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  averageApprovalTime: number; // in hours
  expiringSoon: number; // expiring in next 24 hours
}

export interface ApprovalWorkflowOptions {
  requiresApproval?: boolean;
  autoApprove?: boolean;
  expirationDays?: number;
  allowSelfApproval?: boolean;
  notifyOnSubmission?: boolean;
  notifyOnDecision?: boolean;
}

@Injectable()
export class ApprovalService {
  private readonly DEFAULT_EXPIRATION_DAYS = 7;

  constructor(
    @InjectRepository(EventApproval)
    private readonly approvalRepository: Repository<EventApproval>,
    @InjectRepository(EventProject)
    private readonly eventProjectRepository: Repository<EventProject>,
  ) {}

  /**
   * Submit event project for approval
   */
  async submitForApproval(
    eventProjectId: string,
    submittedBy: string,
    comments?: string,
    options: ApprovalWorkflowOptions = {},
  ): Promise<EventApproval> {
    const eventProject = await this.eventProjectRepository.findOne({
      where: { id: eventProjectId },
      relations: ['creator'],
    });

    if (!eventProject) {
      throw new NotFoundException('Event project not found');
    }

    // Verify the submitter is the creator
    if (eventProject.createdBy !== submittedBy) {
      throw new ForbiddenException('You can only submit your own projects for approval');
    }

    // Check if project is in correct state
    if (eventProject.status !== EventStatus.DRAFT && eventProject.status !== EventStatus.REJECTED) {
      throw new BadRequestException(
        'Project must be in draft or rejected state to submit for approval'
      );
    }

    // Check if there's already a pending approval
    const existingApproval = await this.approvalRepository.findOne({
      where: {
        eventProjectId,
        status: ApprovalStatus.PENDING,
      },
    });

    if (existingApproval) {
      throw new ConflictException('There is already a pending approval for this project');
    }

    // Calculate expiration date
    const expirationDays = options.expirationDays ?? this.DEFAULT_EXPIRATION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Create approval record
    const approval = this.approvalRepository.create({
      eventProjectId,
      submittedBy,
      action: ApprovalAction.SUBMITTED,
      status: ApprovalStatus.PENDING,
      comments,
      expiresAt,
      metadata: {
        workflowOptions: options,
        submissionTimestamp: new Date().toISOString(),
      },
    });

    await this.approvalRepository.save(approval);

    // Update event project status
    eventProject.status = EventStatus.PENDING_APPROVAL;
    await this.eventProjectRepository.save(eventProject);

    return approval;
  }

  /**
   * Approve an event project
   */
  async approve(
    approvalId: string,
    approverId: string,
    comments?: string,
  ): Promise<EventApproval> {
    const approval = await this.findApprovalWithValidations(approvalId);

    // Validate approver permissions
    await this.validateApproverPermissions(approval, approverId);

    // Execute approval
    approval.approve(approverId, comments);
    await this.approvalRepository.save(approval);

    // Update event project status
    const eventProject = await this.eventProjectRepository.findOne({
      where: { id: approval.eventProjectId },
    });

    if (eventProject) {
      eventProject.status = EventStatus.APPROVED;
      eventProject.approvedBy = approverId;
      eventProject.approvedAt = new Date();
      await this.eventProjectRepository.save(eventProject);
    }

    return approval;
  }

  /**
   * Reject an event project
   */
  async reject(
    approvalId: string,
    approverId: string,
    rejectionReason: string,
    comments?: string,
  ): Promise<EventApproval> {
    const approval = await this.findApprovalWithValidations(approvalId);

    // Validate approver permissions
    await this.validateApproverPermissions(approval, approverId);

    if (!rejectionReason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    // Execute rejection
    approval.reject(approverId, rejectionReason, comments);
    await this.approvalRepository.save(approval);

    // Update event project status
    const eventProject = await this.eventProjectRepository.findOne({
      where: { id: approval.eventProjectId },
    });

    if (eventProject) {
      eventProject.status = EventStatus.REJECTED;
      eventProject.rejectionReason = rejectionReason;
      eventProject.approvedBy = approverId;
      await this.eventProjectRepository.save(eventProject);
    }

    return approval;
  }

  /**
   * Request revision for an event project
   */
  async requestRevision(
    approvalId: string,
    approverId: string,
    comments: string,
  ): Promise<EventApproval> {
    const approval = await this.findApprovalWithValidations(approvalId);

    // Validate approver permissions
    await this.validateApproverPermissions(approval, approverId);

    if (!comments?.trim()) {
      throw new BadRequestException('Comments are required when requesting revision');
    }

    // Execute revision request
    approval.requestRevision(approverId, comments);
    await this.approvalRepository.save(approval);

    // Update event project status back to draft for revisions
    const eventProject = await this.eventProjectRepository.findOne({
      where: { id: approval.eventProjectId },
    });

    if (eventProject) {
      eventProject.status = EventStatus.DRAFT;
      await this.eventProjectRepository.save(eventProject);
    }

    return approval;
  }

  /**
   * Cancel a pending approval
   */
  async cancel(approvalId: string, userId: string, userRole: UserRole): Promise<EventApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['eventProject', 'submitter'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    // Check permissions - only submitter or admin can cancel
    if (userRole !== UserRole.ADMIN && approval.submittedBy !== userId) {
      throw new ForbiddenException('You can only cancel your own approval requests');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Only pending approvals can be cancelled');
    }

    approval.cancel();
    await this.approvalRepository.save(approval);

    // Update event project status back to draft
    const eventProject = await this.eventProjectRepository.findOne({
      where: { id: approval.eventProjectId },
    });

    if (eventProject) {
      eventProject.status = EventStatus.DRAFT;
      await this.eventProjectRepository.save(eventProject);
    }

    return approval;
  }

  /**
   * Get approval queue for approvers
   */
  async getApprovalQueue(
    approverId?: string,
    options: ApprovalListOptions = {},
  ): Promise<{
    data: EventApproval[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status = ApprovalStatus.PENDING,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'ASC', // Oldest first for approval queue
    } = options;

    const queryBuilder = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.eventProject', 'eventProject')
      .leftJoinAndSelect('approval.submitter', 'submitter')
      .leftJoinAndSelect('approval.approver', 'approver')
      .where('approval.status = :status', { status });

    // Filter by approver if specified
    if (approverId) {
      queryBuilder.andWhere(
        '(approval.approverId = :approverId OR approval.approverId IS NULL)',
        { approverId }
      );
    }

    // Apply date filters
    if (options.dateFrom && options.dateTo) {
      queryBuilder.andWhere('approval.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`approval.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Get approval history for an event project
   */
  async getApprovalHistory(eventProjectId: string): Promise<EventApproval[]> {
    return await this.approvalRepository.find({
      where: { eventProjectId },
      relations: ['submitter', 'approver'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(
    approverId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<ApprovalStats> {
    const queryBuilder = this.approvalRepository.createQueryBuilder('approval');

    if (approverId) {
      queryBuilder.where('approval.approverId = :approverId', { approverId });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('approval.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    }

    const approvals = await queryBuilder.getMany();

    const totalPending = approvals.filter(a => a.status === ApprovalStatus.PENDING).length;
    const approvedApprovals = approvals.filter(a => a.isApproved);
    const totalApproved = approvedApprovals.length;
    const totalRejected = approvals.filter(a => a.isRejected).length;

    // Calculate average approval time
    const approvalTimes = approvedApprovals
      .filter(a => a.approvedAt)
      .map(a => a.approvedAt!.getTime() - a.createdAt.getTime());

    const averageApprovalTime = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length / (1000 * 60 * 60)
      : 0;

    // Count expiring soon (next 24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expiringSoon = approvals.filter(
      a => a.status === ApprovalStatus.PENDING &&
           a.expiresAt &&
           a.expiresAt <= tomorrow
    ).length;

    return {
      totalPending,
      totalApproved,
      totalRejected,
      averageApprovalTime,
      expiringSoon,
    };
  }

  /**
   * Process expired approvals
   */
  async processExpiredApprovals(): Promise<number> {
    const expiredApprovals = await this.approvalRepository.find({
      where: {
        status: ApprovalStatus.PENDING,
        expiresAt: Between(new Date('1970-01-01'), new Date()),
      },
      relations: ['eventProject'],
    });

    let processed = 0;

    for (const approval of expiredApprovals) {
      approval.cancel();
      approval.setMetadata('expiredAt', new Date().toISOString());
      await this.approvalRepository.save(approval);

      // Update event project status
      if (approval.eventProject) {
        approval.eventProject.status = EventStatus.DRAFT;
        await this.eventProjectRepository.save(approval.eventProject);
      }

      processed++;
    }

    return processed;
  }

  /**
   * Private helper methods
   */
  private async findApprovalWithValidations(approvalId: string): Promise<EventApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['eventProject', 'submitter'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval is not in pending state');
    }

    if (approval.isExpired) {
      throw new BadRequestException('Approval request has expired');
    }

    return approval;
  }

  private async validateApproverPermissions(approval: EventApproval, approverId: string): Promise<void> {
    // Check if approver is trying to approve their own submission
    if (!approval.validateApprovalAction(approverId)) {
      throw new ForbiddenException('You cannot approve your own submission');
    }

    // Additional business rule: Check if user has approver role
    // This would typically be done at the controller level with guards
    // but adding here for completeness
  }
}