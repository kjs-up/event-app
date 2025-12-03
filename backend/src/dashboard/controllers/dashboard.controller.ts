import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
    async getStats() {
        return await this.dashboardService.getDashboardStats();
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get system performance metrics' })
    @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
    async getPerformance() {
        return await this.dashboardService.getPerformanceMetrics();
    }

    @Get('recent-users')
    @ApiOperation({ summary: 'Get recent users' })
    @ApiResponse({ status: 200, description: 'Recent users retrieved successfully' })
    async getRecentUsers() {
        return await this.dashboardService.getRecentUsers();
    }
}
