import api from './index';

export interface ActivityLog {
  id: string;
  schoolId: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
}

export interface GetLogsParams {
  schoolId: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedLogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const logsApi = {
  getLogs: async (params: GetLogsParams): Promise<PaginatedLogsResponse> => {
    const response = await api.get('/activity-logs', { params });
    return response.data;
  },
};
