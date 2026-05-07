import api from './index';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface CreateTimetableDto {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  groupLabel?: string;
  subjectId: string;
  teacherId: string;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  groupLabel?: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    fullName: string;
  };
}

export const timetableApi = {
  getTimetables: async (schoolId: string, groupLabel?: string) => {
    const params: any = { schoolId };
    if (groupLabel) {
      params.groupLabel = groupLabel;
    }
    const response = await api.get(`/timetable`, { params });
    return response.data;
  },

  createTimetable: async (schoolId: string, data: CreateTimetableDto) => {
    const payload = {
      ...data,
      schoolId // Send schoolId just in case backend gets updated to support it
    };
    const response = await api.post(`/timetable`, payload);
    return response.data;
  },

  deleteTimetable: async (id: string) => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },
};
