import { api } from './api';

export interface EventProject {
  id: string;
  name: string;
  description?: string;
  eventType: 'training' | 'seminar' | 'concert' | 'entertainment' | 'foundation';
  foundationTemplateId?: string;
  maxCapacity: number;
  isPaid: boolean;
  basePrice?: number;
  currency: string;
  hasSpeakers: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  approver?: User;
  foundationTemplate?: FoundationTemplate;
  approvals?: EventApproval[];
}

export interface EventApproval {
  id: string;
  eventProjectId: string;
  approverId?: string;
  submittedBy: string;
  action: 'submitted' | 'approved' | 'rejected' | 'revision_requested';
  status: 'pending' | 'completed' | 'cancelled';
  comments?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  eventProject?: EventProject;
  submitter?: User;
  approver?: User;
}

export interface FoundationTemplate {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  defaultCapacity: number;
  defaultIsPaid: boolean;
  defaultPrice?: number;
  defaultHasSpeakers: boolean;
  configuration?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'maker' | 'approver' | 'admin';
  isActive: boolean;
}

export interface CreateEventProjectDto {
  name: string;
  description?: string;
  eventType: 'training' | 'seminar' | 'concert' | 'entertainment' | 'foundation';
  foundationTemplateId?: string;
  maxCapacity: number;
  isPaid: boolean;
  basePrice?: number;
  currency?: string;
  hasSpeakers: boolean;
}

export interface UpdateEventProjectDto extends Partial<CreateEventProjectDto> {
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  rejectionReason?: string;
}

export interface EventProjectListOptions {
  status?: string;
  eventType?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'maxCapacity';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApprovalListOptions {
  status?: 'pending' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentActivity: number;
}

export interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  averageApprovalTime: number;
  expiringSoon: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Event Projects API
export const eventProjectsApi = {
  // Get all event projects with filtering and pagination
  async getAll(options: EventProjectListOptions = {}): Promise<PaginatedResponse<EventProject>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return await api.get(`/event-projects?${params.toString()}`);
  },

  // Get event project by ID
  async getById(id: string): Promise<EventProject> {
    return await api.get(`/event-projects/${id}`);
  },

  // Create new event project
  async create(data: CreateEventProjectDto): Promise<EventProject> {
    return await api.post('/event-projects', data);
  },

  // Update event project
  async update(id: string, data: UpdateEventProjectDto): Promise<EventProject> {
    return await api.put(`/event-projects/${id}`, data);
  },

  // Submit event project for approval
  async submitForApproval(id: string, comments?: string): Promise<EventProject> {
    return await api.post(`/event-projects/${id}/submit`, { comments });
  },

  // Delete event project
  async delete(id: string): Promise<void> {
    await api.delete(`/event-projects/${id}`);
  },

  // Get event project statistics
  async getStats(): Promise<EventProjectStats> {
    return await api.get('/event-projects/stats');
  },
};

// Approvals API
export const approvalsApi = {
  // Get approval by ID
  async getById(id: string): Promise<EventApproval> {
    return await api.get(`/approvals/${id}`);
  },

  // Submit event for approval
  async submitEvent(eventId: string, comments?: string): Promise<EventApproval> {
    return await api.post(`/approvals/events/${eventId}/submit`, { comments });
  },

  // Get approval queue
  async getQueue(options: ApprovalListOptions = {}): Promise<PaginatedResponse<EventApproval>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return await api.get(`/approvals/queue?${params.toString()}`);
  },

  // Get approval history for an event
  async getHistory(eventId: string): Promise<EventApproval[]> {
    return await api.get(`/approvals/events/${eventId}/history`);
  },

  // Approve event
  async approve(approvalId: string, comments?: string): Promise<EventApproval> {
    return await api.post(`/approvals/${approvalId}/approve`, { comments });
  },

  // Reject event
  async reject(approvalId: string, rejectionReason: string, comments?: string): Promise<EventApproval> {
    return await api.post(`/approvals/${approvalId}/reject`, {
      rejectionReason,
      comments,
    });
  },

  // Request revision
  async requestRevision(approvalId: string, comments: string): Promise<EventApproval> {
    return await api.post(`/approvals/${approvalId}/request-revision`, { comments });
  },

  // Cancel approval
  async cancel(approvalId: string): Promise<void> {
    await api.delete(`/approvals/${approvalId}`);
  },

  // Get approval statistics
  async getStats(dateFrom?: string, dateTo?: string): Promise<ApprovalStats> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return await api.get(`/approvals/stats?${params.toString()}`);
  },

  // Process expired approvals (admin only)
  async processExpired(): Promise<{ processed: number }> {
    return await api.post('/approvals/process-expired');
  },
};

// Combined exports for convenience
export const eventsService = {
  ...eventProjectsApi,
  approvals: approvalsApi,
};