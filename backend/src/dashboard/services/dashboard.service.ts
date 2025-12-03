import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { EventProjectService } from '../../events/services/event-project.service';
import { ApprovalService } from '../../events/services/approval.service';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class DashboardService {
    constructor(
        private readonly usersService: UsersService,
        private readonly eventProjectService: EventProjectService,
        private readonly approvalService: ApprovalService,
    ) { }

    async getDashboardStats() {
        const [userStats, eventStats, approvalStats] = await Promise.all([
            this.usersService.getStats(),
            this.eventProjectService.getStats(undefined, UserRole.ADMIN),
            this.approvalService.getApprovalStats(),
        ]);

        // Mock revenue for now
        const revenue = {
            amount: 45320,
            change: 8.2,
        };

        // Mock system health
        const systemHealth = {
            status: 'Operational',
            percentage: 99.8,
        };

        // Mock active alerts
        const activeAlerts = {
            count: 3,
            details: [
                { type: 'high', message: 'High CPU Usage', time: '5 minutes ago' },
                { type: 'medium', message: 'Payment Gateway Latency', time: '15 minutes ago' },
            ],
        };

        return {
            activeUsers: {
                count: userStats.total,
                newToday: userStats.newToday,
            },
            events: {
                total: eventStats.total,
                active: eventStats.byStatus['PUBLISHED'] || 0,
            },
            approvals: {
                pending: approvalStats.totalPending,
                expiringSoon: approvalStats.expiringSoon,
            },
            revenue,
            systemHealth,
            activeAlerts,
        };
    }

    async getPerformanceMetrics() {
        // Mock performance data
        const now = new Date();
        const data = [];
        for (let i = 0; i < 7; i++) {
            const time = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000); // Every 4 hours
            data.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
                memory: Math.floor(Math.random() * 40) + 20, // 20-60%
                response: Number((Math.random() * 2 + 0.5).toFixed(1)), // 0.5-2.5s
            });
        }
        return data;
    }

    async getRecentUsers() {
        const users = await this.usersService.findAll();
        return users.slice(0, 5).map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            org: 'N/A', // Organization not yet in User entity
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
            status: user.isActive ? 'Active' : 'Inactive',
        }));
    }
}
