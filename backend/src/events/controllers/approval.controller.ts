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
import { ApprovalService, ApprovalListOptions } from '../services/approval.service';
import {
  SubmitApprovalDto,
  ApproveEventDto,
  RejectEventDto,
  RequestRevisionDto,
} from '../dto';
import { EventApproval, ApprovalStatus } from '../entities/event-approval.entity';

@ApiTags('Event Approvals')
@ApiBearerAuth()
@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('events/:eventId/submit')
  @ApiOperation({
    summary: 'Submit event for approval',
    description: 'Submits an event project to the approval workflow.',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiBody({ type: SubmitApprovalDto })
  @ApiResponse({
    status: 201,
    description: 'Event submitted for approval successfully',
    type: EventApproval,
  })
  @ApiResponse({
    status: 400,
    description: 'Event cannot be submitted for approval',
  })
  @ApiResponse({
    status: 403,
    description: 'Only event creators can submit for approval',
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Event already has a pending approval',
  })
  @Roles(UserRole.MAKER, UserRole.ADMIN)
  async submitEventForApproval(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() submitDto: SubmitApprovalDto,
    @Request() req: any,
  ): Promise<EventApproval> {
    return await this.approvalService.submitForApproval(
      eventId,
      req.user.userId,
      submitDto.comments,
    );
  }

  @Get('queue')
  @ApiOperation({
    summary: 'Get approval queue',
    description: 'Retrieves the approval queue for approvers with filtering and pagination.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ApprovalStatus,
    description: 'Filter by approval status (default: pending)',
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
    description: 'Items per page (default: 10, max: 50)',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    format: 'date',
    description: 'Filter approvals from this date',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    format: 'date',
    description: 'Filter approvals until this date',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval queue retrieved successfully',
  })
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async getApprovalQueue(
    @Query() query: any,
    @Request() req: any,
  ): Promise<{
    data: EventApproval[];
    total: number;
    page: number;
    limit: number;
  }> {
    const options: ApprovalListOptions = {
      ...query,
      limit: Math.min(query.limit || 10, 50), // Cap at 50 items per page
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    const approverId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;

    return await this.approvalService.getApprovalQueue(approverId, options);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get approval statistics',
    description: 'Retrieves statistical information about approvals.',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    format: 'date',
    description: 'Statistics from this date',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    format: 'date',
    description: 'Statistics until this date',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval statistics retrieved successfully',
  })
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async getApprovalStats(
    @Query() query: any,
    @Request() req: any,
  ) {
    const approverId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    return await this.approvalService.getApprovalStats(approverId, dateFrom, dateTo);
  }

  @Get('events/:eventId/history')
  @ApiOperation({
    summary: 'Get approval history for event',
    description: 'Retrieves the complete approval history for a specific event.',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'Event project UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval history retrieved successfully',
    type: [EventApproval],
  })
  @ApiResponse({
    status: 404,
    description: 'Event project not found',
  })
  async getApprovalHistory(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventApproval[]> {
    return await this.approvalService.getApprovalHistory(eventId);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve event',
    description: 'Approves a pending event project.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Approval UUID',
    format: 'uuid',
  })
  @ApiBody({ type: ApproveEventDto })
  @ApiResponse({
    status: 200,
    description: 'Event approved successfully',
    type: EventApproval,
  })
  @ApiResponse({
    status: 400,
    description: 'Approval is not in pending state or has expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot approve own submission',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval not found',
  })
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveEventDto,
    @Request() req: any,
  ): Promise<EventApproval> {
    return await this.approvalService.approve(
      id,
      req.user.userId,
      approveDto.comments,
    );
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject event',
    description: 'Rejects a pending event project with a reason.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Approval UUID',
    format: 'uuid',
  })
  @ApiBody({ type: RejectEventDto })
  @ApiResponse({
    status: 200,
    description: 'Event rejected successfully',
    type: EventApproval,
  })
  @ApiResponse({
    status: 400,
    description: 'Approval is not in pending state or has expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot reject own submission',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval not found',
  })
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectEventDto,
    @Request() req: any,
  ): Promise<EventApproval> {
    return await this.approvalService.reject(
      id,
      req.user.userId,
      rejectDto.rejectionReason,
      rejectDto.comments,
    );
  }

  @Post(':id/request-revision')
  @ApiOperation({
    summary: 'Request revision for event',
    description: 'Requests revision for a pending event project, returning it to draft state.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Approval UUID',
    format: 'uuid',
  })
  @ApiBody({ type: RequestRevisionDto })
  @ApiResponse({
    status: 200,
    description: 'Revision requested successfully',
    type: EventApproval,
  })
  @ApiResponse({
    status: 400,
    description: 'Approval is not in pending state or has expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot request revision for own submission',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval not found',
  })
  @Roles(UserRole.APPROVER, UserRole.ADMIN)
  async requestRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() revisionDto: RequestRevisionDto,
    @Request() req: any,
  ): Promise<EventApproval> {
    return await this.approvalService.requestRevision(
      id,
      req.user.userId,
      revisionDto.comments,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel approval request',
    description: 'Cancels a pending approval request.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Approval UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Approval request cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Approval is not in pending state',
  })
  @ApiResponse({
    status: 403,
    description: 'Only submitter or admin can cancel approval',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.approvalService.cancel(id, req.user.userId, req.user.role);
  }

  @Post('process-expired')
  @ApiOperation({
    summary: 'Process expired approvals',
    description: 'Administrative endpoint to process and cancel expired approval requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired approvals processed successfully',
    schema: {
      type: 'object',
      properties: {
        processed: {
          type: 'number',
          description: 'Number of expired approvals processed',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN)
  async processExpiredApprovals(): Promise<{ processed: number }> {
    const processed = await this.approvalService.processExpiredApprovals();
    return { processed };
  }
}