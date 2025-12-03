import { api } from './api';
import { User } from '../types';

export interface DashboardStats {
    activeUsers: {
        count: number;
        newToday: number;
    };
    events: {
        total: number;
        active: number;
    };
    approvals: {
        pending: number;
        expiringSoon: number;
    };
    revenue: {
        amount: number;
        change: number;
    };
    systemHealth: {
        status: string;
        percentage: number;
    };
    activeAlerts: {
        count: number;
        details: Array<{
            type: string;
            message: string;
            time: string;
        }>;
    };
}

export interface PerformanceMetric {
    time: string;
    cpu: number;
    memory: number;
    response: number;
}

export interface RecentUser {
    id: string;
    name: string;
    email: string;
    role: string;
    org: string;
    lastLogin: string;
    status: string;
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        return api.get<DashboardStats>('/dashboard/stats');
    },

    async getPerformance(): Promise<PerformanceMetric[]> {
        return api.get<PerformanceMetric[]>('/dashboard/performance');
    },

    async getRecentUsers(): Promise<RecentUser[]> {
        return api.get<RecentUser[]>('/dashboard/recent-users');
    },
};
