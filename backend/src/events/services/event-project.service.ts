import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import {
  EventProject,
  EventStatus,
  EventType,
} from '../entities/event-project.entity';
import { FoundationTemplate } from '../entities/foundation-template.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { CreateEventProjectDto } from '../dto/create-event-project.dto';
import { UpdateEventProjectDto } from '../dto/update-event-project.dto';

export interface EventProjectListOptions {
  status?: EventStatus;
  eventType?: EventType;
  createdBy?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'maxCapacity';
  sortOrder?: 'ASC' | 'DESC';
}

export interface EventProjectStats {
  total: number;
  byStatus: Record<EventStatus, number>;
  byType: Record<EventType, number>;
  recentActivity: number; // Projects created in last 7 days
}

@Injectable()
export class EventProjectService {
  constructor(
    @InjectRepository(EventProject)
    private readonly eventProjectRepository: Repository<EventProject>,
    @InjectRepository(FoundationTemplate)
    private readonly foundationTemplateRepository: Repository<FoundationTemplate>,
  ) {}

  /**
   * Create a new event project
   */
  async create(
    createDto: CreateEventProjectDto,
    createdBy: string,
  ): Promise<EventProject> {
    // Validate foundation template if provided
    if (createDto.foundationTemplateId) {
      const template = await this.foundationTemplateRepository.findOne({
        where: { id: createDto.foundationTemplateId, isActive: true },
      });

      if (!template) {
        throw new NotFoundException('Foundation template not found');
      }

      // Apply template defaults if not overridden
      if (!template.validateConfiguration()) {
        throw new BadRequestException('Foundation template has invalid configuration');
      }
    }

    // Validate business rules
    this.validateEventProject(createDto);

    const eventProject = this.eventProjectRepository.create({
      ...createDto,
      createdBy,
      status: EventStatus.DRAFT,
    });

    return await this.eventProjectRepository.save(eventProject);
  }

  /**
   * Find all event projects with filtering and pagination
   */
  async findAll(options: EventProjectListOptions = {}): Promise<{
    data: EventProject[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      eventType,
      createdBy,
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.eventProjectRepository
      .createQueryBuilder('ep')
      .leftJoinAndSelect('ep.creator', 'creator')
      .leftJoinAndSelect('ep.approver', 'approver')
      .leftJoinAndSelect('ep.foundationTemplate', 'template');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('ep.status = :status', { status });
    }

    if (eventType) {
      queryBuilder.andWhere('ep.eventType = :eventType', { eventType });
    }

    if (createdBy) {
      queryBuilder.andWhere('ep.createdBy = :createdBy', { createdBy });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(ep.name) LIKE :search OR LOWER(ep.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`ep.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find event project by ID
   */
  async findOne(id: string, relations: string[] = []): Promise<EventProject> {
    const options: FindOneOptions<EventProject> = {
      where: { id },
      relations: ['creator', 'approver', 'foundationTemplate', ...relations],
    };

    const eventProject = await this.eventProjectRepository.findOne(options);

    if (!eventProject) {
      throw new NotFoundException('Event project not found');
    }

    return eventProject;
  }

  /**
   * Update event project
   */
  async update(
    id: string,
    updateDto: UpdateEventProjectDto,
    userId: string,
    userRole: UserRole,
  ): Promise<EventProject> {
    const eventProject = await this.findOne(id);

    // Check permissions
    if (!this.canModifyEventProject(eventProject, userId, userRole)) {
      throw new ForbiddenException('You cannot modify this event project');
    }

    // Validate state changes
    if (updateDto.status && !eventProject.validateStateTransition(updateDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${eventProject.status} to ${updateDto.status}`
      );
    }

    // Validate foundation template if changed
    if (updateDto.foundationTemplateId && updateDto.foundationTemplateId !== eventProject.foundationTemplateId) {
      const template = await this.foundationTemplateRepository.findOne({
        where: { id: updateDto.foundationTemplateId, isActive: true },
      });

      if (!template) {
        throw new NotFoundException('Foundation template not found');
      }
    }

    // Validate business rules for the updated data
    const updatedData = { ...eventProject, ...updateDto };
    this.validateEventProject(updatedData);

    Object.assign(eventProject, updateDto);
    return await this.eventProjectRepository.save(eventProject);
  }

  /**
   * Submit event project for approval
   */
  async submitForApproval(id: string, userId: string): Promise<EventProject> {
    const eventProject = await this.findOne(id);

    if (eventProject.createdBy !== userId) {
      throw new ForbiddenException('You can only submit your own event projects');
    }

    if (!eventProject.canBeModified) {
      throw new BadRequestException('This event project cannot be modified');
    }

    // Validate completeness before submission
    this.validateEventProjectForSubmission(eventProject);

    eventProject.status = EventStatus.PENDING_APPROVAL;
    return await this.eventProjectRepository.save(eventProject);
  }

  /**
   * Approve event project
   */
  async approve(id: string, approverId: string, comments?: string): Promise<EventProject> {
    const eventProject = await this.findOne(id);

    if (eventProject.status !== EventStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Event project is not pending approval');
    }

    if (eventProject.createdBy === approverId) {
      throw new ForbiddenException('You cannot approve your own event project');
    }

    eventProject.status = EventStatus.APPROVED;
    eventProject.approvedBy = approverId;
    eventProject.approvedAt = new Date();

    return await this.eventProjectRepository.save(eventProject);
  }

  /**
   * Reject event project
   */
  async reject(
    id: string,
    approverId: string,
    rejectionReason: string,
  ): Promise<EventProject> {
    const eventProject = await this.findOne(id);

    if (eventProject.status !== EventStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Event project is not pending approval');
    }

    if (eventProject.createdBy === approverId) {
      throw new ForbiddenException('You cannot reject your own event project');
    }

    eventProject.status = EventStatus.REJECTED;
    eventProject.approvedBy = approverId;
    eventProject.rejectionReason = rejectionReason;

    return await this.eventProjectRepository.save(eventProject);
  }

  /**
   * Delete event project (soft delete by archiving)
   */
  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const eventProject = await this.findOne(id);

    if (!this.canDeleteEventProject(eventProject, userId, userRole)) {
      throw new ForbiddenException('You cannot delete this event project');
    }

    if (eventProject.status === EventStatus.APPROVED) {
      eventProject.status = EventStatus.ARCHIVED;
      await this.eventProjectRepository.save(eventProject);
    } else {
      await this.eventProjectRepository.remove(eventProject);
    }
  }

  /**
   * Get event project statistics
   */
  async getStats(userId?: string, userRole?: UserRole): Promise<EventProjectStats> {
    const queryBuilder = this.eventProjectRepository.createQueryBuilder('ep');

    // Filter by user if not admin
    if (userId && userRole !== UserRole.ADMIN) {
      queryBuilder.where('ep.createdBy = :userId', { userId });
    }

    const [projects, total] = await queryBuilder.getManyAndCount();

    // Calculate stats
    const byStatus = Object.values(EventStatus).reduce((acc, status) => {
      acc[status] = projects.filter(p => p.status === status).length;
      return acc;
    }, {} as Record<EventStatus, number>);

    const byType = Object.values(EventType).reduce((acc, type) => {
      acc[type] = projects.filter(p => p.eventType === type).length;
      return acc;
    }, {} as Record<EventType, number>);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = projects.filter(p => p.createdAt > weekAgo).length;

    return {
      total,
      byStatus,
      byType,
      recentActivity,
    };
  }

  /**
   * Private helper methods
   */
  private validateEventProject(eventProject: Partial<EventProject>): void {
    // Validate capacity
    if (eventProject.maxCapacity && (!eventProject.maxCapacity || eventProject.maxCapacity > 2000)) {
      throw new BadRequestException('Max capacity must be between 1 and 2000');
    }

    // Validate paid event
    if (eventProject.isPaid && (!eventProject.basePrice || eventProject.basePrice <= 0)) {
      throw new BadRequestException('Paid events must have a base price greater than 0');
    }

    // Validate free event
    if (!eventProject.isPaid && eventProject.basePrice && eventProject.basePrice > 0) {
      throw new BadRequestException('Free events cannot have a base price');
    }
  }

  private validateEventProjectForSubmission(eventProject: EventProject): void {
    if (!eventProject.name?.trim()) {
      throw new BadRequestException('Event name is required for submission');
    }

    if (!eventProject.description?.trim()) {
      throw new BadRequestException('Event description is required for submission');
    }

    this.validateEventProject(eventProject);
  }

  private canModifyEventProject(
    eventProject: EventProject,
    userId: string,
    userRole: UserRole,
  ): boolean {
    // Admin can modify any project
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Creators can modify their own projects in draft or rejected state
    if (eventProject.createdBy === userId) {
      return eventProject.canBeModified;
    }

    // Approvers can only change status of pending projects
    if (userRole === UserRole.APPROVER) {
      return eventProject.status === EventStatus.PENDING_APPROVAL;
    }

    return false;
  }

  private canDeleteEventProject(
    eventProject: EventProject,
    userId: string,
    userRole: UserRole,
  ): boolean {
    // Admin can delete any project
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Creators can only delete their own draft projects
    if (eventProject.createdBy === userId) {
      return eventProject.status === EventStatus.DRAFT;
    }

    return false;
  }
}