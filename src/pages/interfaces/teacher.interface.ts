export interface TeacherInterface {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  subjects?: string[];
  assignedClasses?: string[];
  schoolId: string;
  status: string;
}
