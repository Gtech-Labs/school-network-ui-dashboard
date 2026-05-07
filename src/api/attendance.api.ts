import api from './index';

export const attendanceApi = {
  getAttendance: async (params: any) => {
    const { data } = await api.get('/attendance', { params });
    return data;
  },

  getAttendanceSummary: async (params: any) => {
    const { data } = await api.get('/attendance/summary', { params });
    return data;
  },

  bulkValidateAttendance: async (records: any[]) => {
    const { data } = await api.post('/attendance/bulk-validate', records);
    return data;
  },

  bulkCreateAttendance: async (records: any[]) => {
    const { data } = await api.post('/attendance/bulk-create', records);
    return data;
  },

  updateAttendance: async (id: string, payload: any) => {
    const { data } = await api.patch(`/attendance/${id}`, payload);
    return data;
  },

  deleteAttendance: async (id: string) => {
    const { data } = await api.delete(`/attendance/${id}`);
    return data;
  },
};
