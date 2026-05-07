import { useQuery } from '@tanstack/react-query';
import { logsApi, GetLogsParams } from '@/api/logs.api';

export const useActivityLogs = (params: GetLogsParams) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => logsApi.getLogs(params),
    enabled: !!params.schoolId,
  });
};
