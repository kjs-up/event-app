import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EventProjectService, EventProjectListOptions } from '../services/event-project.service';
import {
  CreateEventProjectDto,
  UpdateEventProjectDto,
  SubmitApprovalDto,
} from '../dto';
import { EventProject } from '../entities/event-project.entity';
import { EventType, EventStatus } from '../enums/event.enums';

@ApiTags('Event Projects')
@ApiBearerAuth()
@Controller('event-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventProjectController {
  constructor(private readonly eventProjectService: EventProjectService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new event project',
    description: 'Creates a new event project in draft status. Only makers and admins can create events.',
  })
  @ApiBody({ type: CreateEventProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Event project created successfully',
    type: EventProject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Foundation template not found (if specified)',
  })
  @Roles(UserRole.MAKER, UserRole.ADMIN)
  async create(
    @Body() createDto: CreateEventProjectDto,
    @Request() req: any,
  ): Promise<EventProject> {
    return await this.eventProjectService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all event projects',
    description: 'Retrieves a paginated list of event projects with filtering options.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EventStatus,
    description: 'Filter by event status',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    enum: EventType,
    description: 'Filter by event type',
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    type: String,
    description: 'Filter by creator user ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in event name and description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name', 'maxCapacity'],
    description: 'Sort field (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Event projects retrieved successfully',
  })
  async findAll(
    @Query() query: any,
    @Request() req: any,
  ): Promise<{
    data: EventProject[];
    total: number;
    page: number;
    limit: number;
  }> {
    const options: EventProjectListOptions = {
      ...query,
      limit: Math.min(query.limit || 10, 100), // Cap at 100 items per page
    };

    // Allow all users to see all events
    // if (req.user.role !== UserRole.ADMIN && !query.createdBy) {
    //   if (query.status === EventStatus.APPROVED) {
    //     // Allow viewing all approved events
    //   } else {
    //     // Otherwise restrict to own events
    //     options.createdBy = req.user.userId;
    //   }
    // }

    return await this.eventProjectService.findAll(options);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get event project statistics',
    description: 'Retrieves statistical information about event projects.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@Request() req: any) {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
    return await this.eventProjectService.getStats(userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event project by ID',
    description: 'Retrieves a specific event project with all related information.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Event project retrieved successfully',
    type: EventProject,
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<EventProject> {
    const eventProject = await this.eventProjectService.findOne(id, ['approvals', 'batches']);

    // Non-admin users can only view their own events or approved events
    if (req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.APPROVER &&
      eventProject.createdBy !== req.user.userId &&
      eventProject.status !== EventStatus.APPROVED) {
      throw new ForbiddenException('Access denied');
    }

    return eventProject;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update event project',
    description: 'Updates an existing event project. Restrictions apply based on current status and user role.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateEventProjectDto })
  @ApiResponse({
    status: 200,
    description: 'Event project updated successfully',
    type: EventProject,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data or state transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to update this event',
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEventProjectDto,
    @Request() req: any,
  ): Promise<EventProject> {
    return await this.eventProjectService.update(
      id,
      updateDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit event project for approval',
    description: 'Submits an event project for approval workflow. Only draft or rejected events can be submitted.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiBody({ type: SubmitApprovalDto })
  @ApiResponse({
    status: 200,
    description: 'Event project submitted for approval successfully',
    type: EventProject,
  })
  @ApiResponse({
    status: 400,
    description: 'Event project cannot be submitted in current state',
  })
  @ApiResponse({
    status: 403,
    description: 'Only event creators can submit for approval',
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  @Roles(UserRole.MAKER, UserRole.ADMIN)
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitDto: SubmitApprovalDto,
    @Request() req: any,
  ): Promise<EventProject> {
    return await this.eventProjectService.submitForApproval(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete event project',
    description: 'Deletes an event project. Draft events are permanently deleted, approved events are archived.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Event project deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to delete this event',
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.eventProjectService.remove(id, req.user.userId, req.user.role);
  }
}