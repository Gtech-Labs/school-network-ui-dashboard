import api from './index';

export type EventType = 'exam' | 'holiday' | 'meeting' | 'activity' | 'other';

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  gradeId?: string;
  classId?: string;
  grade?: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  gradeId?: string;
  classId?: string;
  grade?: string;
  subject?: string;
}

export const calendarApi = {
  getEvents: async (schoolId: string, gradeId?: string, classId?: string) => {
    const params: any = { schoolId };
    if (gradeId) params.gradeId = gradeId;
    if (classId) params.classId = classId;
    const response = await api.get<CalendarEvent[]>('/events', { params });
    return response.data;
  },

  createEvent: async (data: CreateCalendarEventDto) => {
    const response = await api.post<CalendarEvent>('/events', data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
