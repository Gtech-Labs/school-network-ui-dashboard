import api from './index';

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum DeliveryMethod {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  BOTH = 'BOTH',
}

export interface CreateAnnouncementDto {
  title: string;
  message: string;
  targetRoles?: UserRole[];
  targetGrades?: string[];
  deliveryMethod: DeliveryMethod;
  schoolId: string;
}

export const announcementsApi = {
  createAnnouncement: async (data: CreateAnnouncementDto) => {
    const response = await api.post('/announcement', data);
    return response.data;
  },

  getAnnouncements: async (schoolId: string, params?: any) => {
    const response = await api.get(`/announcement/school/${schoolId}`, { params });
    return response.data;
  },

  getAnnouncementStats: async (schoolId: string) => {
    const response = await api.get(`/announcement/school/${schoolId}/stats`);
    return response.data;
  },
};
