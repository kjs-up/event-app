import { Controller, Post, Body, Param, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventBatchService } from '../services/event-batch.service';
import { EventBatch } from '../entities/event-batch.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Event Batches')
@ApiBearerAuth()
@Controller('event-batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventBatchController {
    constructor(private readonly eventBatchService: EventBatchService) { }

    @Post('project/:projectId')
    @Roles(UserRole.MAKER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new batch for an event project' })
    @ApiResponse({ status: 201, description: 'Batch created successfully' })
    async create(
        @Param('projectId') projectId: string,
        @Body() data: Partial<EventBatch>,
    ) {
        return await this.eventBatchService.createBatch(projectId, data);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get all batches for an event project' })
    @ApiResponse({ status: 200, description: 'Batches retrieved successfully' })
    async getByProject(@Param('projectId') projectId: string) {
        return await this.eventBatchService.getBatchesByEvent(projectId);
    }

    @Delete(':id')
    @Roles(UserRole.MAKER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a batch' })
    @ApiResponse({ status: 204, description: 'Batch deleted successfully' })
    async delete(@Param('id') id: string) {
        return await this.eventBatchService.deleteBatch(id);
    }
}
