import { SchoolFeatures } from './mockData';

const STORAGE_KEY = 'school_features';

const defaultFeatures: SchoolFeatures = {
  applications: true,
  students: true,
  teachers: true,
  parents: true,
  payments: true,
  academicProgress: true,
  attendance: true,
  calendar: true,
  timetable: true,
  announcements: true,
  activityLog: true,
};

export function getSchoolFeatures(schoolId: string): SchoolFeatures {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${schoolId}`);
    if (stored) {
      // Merge stored features with defaults to handle new features
      const parsedFeatures = JSON.parse(stored);
      return { ...defaultFeatures, ...parsedFeatures };
    }
  } catch (error) {
    console.error('Error reading school features:', error);
  }
  
  return { ...defaultFeatures };
}

export function setSchoolFeatures(schoolId: string, features: SchoolFeatures): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${schoolId}`, JSON.stringify(features));
  } catch (error) {
    console.error('Error saving school features:', error);
  }
}

export function getCurrentSchoolId(): string {
  // For demo purposes, using a fixed school ID
  // In production, this would come from authentication/session
  return localStorage.getItem('current_school_id') || '1';
}

export function setCurrentSchoolId(schoolId: string): void {
  localStorage.setItem('current_school_id', schoolId);
}
