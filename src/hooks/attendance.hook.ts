import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance.api';

export const useAttendance = (params: any) => {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApi.getAttendance(params)
  });
};

export const useAttendanceSummary = (params: any) => {
  return useQuery({
    queryKey: ['attendance-summary', params],
    queryFn: () => attendanceApi.getAttendanceSummary(params)
  });
};

export const useBulkValidateAttendance = () => {
  return useMutation({
    mutationFn: (records: any[]) => attendanceApi.bulkValidateAttendance(records)
  });
};

export const useBulkCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: any[]) => attendanceApi.bulkCreateAttendance(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    }
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      attendanceApi.updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    }
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceApi.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    }
  });
};
