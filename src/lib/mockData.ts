// Mock data for the application

export interface SchoolFeatures {
  applications: boolean;
  students: boolean;
  teachers: boolean;
  parents: boolean;
  payments: boolean;
  academicProgress: boolean;
  attendance: boolean;
  calendar: boolean;
  timetable: boolean;
  announcements: boolean;
  activityLog: boolean;
}

export interface School {
  id: string;
  name: string;
  email: string;
  plan: 'Trial' | 'Basic' | 'Premium' | 'Enterprise';
  studentsCount: number;
  teachersCount: number;
  status: 'Active' | 'Suspended' | 'Pending';
  revenue: number;
  joinedDate: string;
  features?: SchoolFeatures;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  feesPaid: number;
  status: 'Active' | 'Inactive';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string[];
  status: 'Active' | 'Inactive';
}

export interface Payment {
  id: string;
  schoolName?: string;
  studentName?: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paidDate?: string;
}

export interface Parent {
  id: string;
  fullName: string;
  relationship: 'Mother' | 'Father' | 'Guardian';
  phone: string;
  email?: string;
  children: Array<{
    studentId: string;
    studentName: string;
    schoolId?: string;
    grade: string;
    class: string;
  }>;
  hasAccountAccess: boolean;
  loginMethod?: 'password' | 'otp';
  consentGiven: boolean;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export const mockSchools: School[] = [
  {
    id: '1',
    name: 'Greenwood High School',
    email: 'admin@greenwood.edu',
    plan: 'Premium',
    studentsCount: 850,
    teachersCount: 45,
    status: 'Active',
    revenue: 12500,
    joinedDate: '2023-01-15',
    features: {
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
    },
  },
  {
    id: '2',
    name: 'Riverside Academy',
    email: 'contact@riverside.edu',
    plan: 'Basic',
    studentsCount: 420,
    teachersCount: 28,
    status: 'Active',
    revenue: 6800,
    joinedDate: '2023-03-22',
  },
  {
    id: '3',
    name: 'Oakmont International',
    email: 'admin@oakmont.edu',
    plan: 'Enterprise',
    studentsCount: 1200,
    teachersCount: 78,
    status: 'Active',
    revenue: 25000,
    joinedDate: '2022-11-08',
  },
  {
    id: '4',
    name: 'Sunset Valley School',
    email: 'info@sunsetvalley.edu',
    plan: 'Trial',
    studentsCount: 180,
    teachersCount: 12,
    status: 'Pending',
    revenue: 0,
    joinedDate: '2024-01-10',
  },
  {
    id: '5',
    name: 'Maple Leaf Academy',
    email: 'admin@mapleleaf.edu',
    plan: 'Basic',
    studentsCount: 320,
    teachersCount: 22,
    status: 'Suspended',
    revenue: 4500,
    joinedDate: '2023-06-15',
  },
];

export const mockStudents: Student[] = [
  // Grade 5 - 10 students
  {
    id: 'S001',
    name: 'Pendihle John',
    email: 'john.d@student.edu',
    class: 'Grade 5',
    parentName: 'Michael Johnson',
    parentEmail: 'michael.j@email.com',
    parentPhone: '+1-555-0101',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S002',
    name: 'Jane Smith',
    email: 'jane.s@student.edu',
    class: 'Grade 5',
    parentName: 'Sarah Smith',
    parentEmail: 'sarah.s@email.com',
    parentPhone: '+1-555-0102',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S003',
    name: 'Samuel Brown',
    email: 'samuel.b@student.edu',
    class: 'Grade 5',
    parentName: 'David Brown',
    parentEmail: 'david.b@email.com',
    parentPhone: '+1-555-0103',
    feesPaid: 50,
    status: 'Active',
  },
  {
    id: 'S004',
    name: 'Emily Davis',
    email: 'emily.d@student.edu',
    class: 'Grade 5',
    parentName: 'Jennifer Davis',
    parentEmail: 'jennifer.d@email.com',
    parentPhone: '+1-555-0104',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S005',
    name: 'Michael Wilson',
    email: 'michael.w@student.edu',
    class: 'Grade 5',
    parentName: 'Robert Wilson',
    parentEmail: 'robert.w@email.com',
    parentPhone: '+1-555-0105',
    feesPaid: 25,
    status: 'Active',
  },
  {
    id: 'S006',
    name: 'Olivia Taylor',
    email: 'olivia.t@student.edu',
    class: 'Grade 5',
    parentName: 'James Taylor',
    parentEmail: 'james.t@email.com',
    parentPhone: '+1-555-0106',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S007',
    name: 'William Anderson',
    email: 'william.a@student.edu',
    class: 'Grade 5',
    parentName: 'Mary Anderson',
    parentEmail: 'mary.a@email.com',
    parentPhone: '+1-555-0107',
    feesPaid: 50,
    status: 'Active',
  },
  {
    id: 'S008',
    name: 'Sophia Martinez',
    email: 'sophia.m@student.edu',
    class: 'Grade 5',
    parentName: 'Carlos Martinez',
    parentEmail: 'carlos.m@email.com',
    parentPhone: '+1-555-0108',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S009',
    name: 'James Garcia',
    email: 'james.g@student.edu',
    class: 'Grade 5',
    parentName: 'Maria Garcia',
    parentEmail: 'maria.g@email.com',
    parentPhone: '+1-555-0109',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S010',
    name: 'Emma Rodriguez',
    email: 'emma.r@student.edu',
    class: 'Grade 5',
    parentName: 'Luis Rodriguez',
    parentEmail: 'luis.r@email.com',
    parentPhone: '+1-555-0110',
    feesPaid: 50,
    status: 'Active',
  },
  // Grade 6 - 8 students
  {
    id: 'S011',
    name: 'Liam Thompson',
    email: 'liam.t@student.edu',
    class: 'Grade 6',
    parentName: 'Karen Thompson',
    parentEmail: 'karen.t@email.com',
    parentPhone: '+1-555-0111',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S012',
    name: 'Ava White',
    email: 'ava.w@student.edu',
    class: 'Grade 6',
    parentName: 'Thomas White',
    parentEmail: 'thomas.w@email.com',
    parentPhone: '+1-555-0112',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S013',
    name: 'Noah Harris',
    email: 'noah.h@student.edu',
    class: 'Grade 6',
    parentName: 'Lisa Harris',
    parentEmail: 'lisa.h@email.com',
    parentPhone: '+1-555-0113',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S014',
    name: 'Isabella Clark',
    email: 'isabella.c@student.edu',
    class: 'Grade 6',
    parentName: 'Richard Clark',
    parentEmail: 'richard.c@email.com',
    parentPhone: '+1-555-0114',
    feesPaid: 50,
    status: 'Active',
  },
  {
    id: 'S015',
    name: 'Mason Lewis',
    email: 'mason.l@student.edu',
    class: 'Grade 6',
    parentName: 'Susan Lewis',
    parentEmail: 'susan.l@email.com',
    parentPhone: '+1-555-0115',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S016',
    name: 'Mia Robinson',
    email: 'mia.r@student.edu',
    class: 'Grade 6',
    parentName: 'Daniel Robinson',
    parentEmail: 'daniel.r@email.com',
    parentPhone: '+1-555-0116',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S017',
    name: 'Ethan Walker',
    email: 'ethan.w@student.edu',
    class: 'Grade 6',
    parentName: 'Nancy Walker',
    parentEmail: 'nancy.w@email.com',
    parentPhone: '+1-555-0117',
    feesPaid: 50,
    status: 'Active',
  },
  {
    id: 'S018',
    name: 'Charlotte Young',
    email: 'charlotte.y@student.edu',
    class: 'Grade 6',
    parentName: 'Mark Young',
    parentEmail: 'mark.y@email.com',
    parentPhone: '+1-555-0118',
    feesPaid: 75,
    status: 'Active',
  },
  // Grade 7 - 6 students
  {
    id: 'S019',
    name: 'Alexander King',
    email: 'alexander.k@student.edu',
    class: 'Grade 7',
    parentName: 'Patricia King',
    parentEmail: 'patricia.k@email.com',
    parentPhone: '+1-555-0119',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S020',
    name: 'Amelia Scott',
    email: 'amelia.s@student.edu',
    class: 'Grade 7',
    parentName: 'William Scott',
    parentEmail: 'william.s@email.com',
    parentPhone: '+1-555-0120',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S021',
    name: 'Benjamin Green',
    email: 'benjamin.g@student.edu',
    class: 'Grade 7',
    parentName: 'Barbara Green',
    parentEmail: 'barbara.g@email.com',
    parentPhone: '+1-555-0121',
    feesPaid: 50,
    status: 'Active',
  },
  {
    id: 'S022',
    name: 'Harper Adams',
    email: 'harper.a@student.edu',
    class: 'Grade 7',
    parentName: 'Charles Adams',
    parentEmail: 'charles.a@email.com',
    parentPhone: '+1-555-0122',
    feesPaid: 100,
    status: 'Active',
  },
  {
    id: 'S023',
    name: 'Lucas Baker',
    email: 'lucas.b@student.edu',
    class: 'Grade 7',
    parentName: 'Elizabeth Baker',
    parentEmail: 'elizabeth.b@email.com',
    parentPhone: '+1-555-0123',
    feesPaid: 75,
    status: 'Active',
  },
  {
    id: 'S024',
    name: 'Evelyn Nelson',
    email: 'evelyn.n@student.edu',
    class: 'Grade 7',
    parentName: 'Joseph Nelson',
    parentEmail: 'joseph.n@email.com',
    parentPhone: '+1-555-0124',
    feesPaid: 50,
    status: 'Active',
  },
];

export const mockParents: Parent[] = [
  {
    id: '1',
    fullName: 'Michael Johnson',
    relationship: 'Father',
    phone: '+1-555-0101',
    email: 'michael.j@email.com',
    children: [
      { studentId: '1', studentName: 'Emma Johnson', grade: 'Grade 10', class: 'Grade 10-A' }
    ],
    hasAccountAccess: true,
    loginMethod: 'password',
    consentGiven: true,
    createdAt: '2023-01-15',
    status: 'Active',
  },
  {
    id: '2',
    fullName: 'Sarah Smith',
    relationship: 'Mother',
    phone: '+1-555-0102',
    email: 'sarah.s@email.com',
    children: [
      { studentId: '2', studentName: 'Liam Smith', grade: 'Grade 10', class: 'Grade 10-A' }
    ],
    hasAccountAccess: true,
    loginMethod: 'otp',
    consentGiven: true,
    createdAt: '2023-02-20',
    status: 'Active',
  },
  {
    id: '3',
    fullName: 'David Brown',
    relationship: 'Father',
    phone: '+1-555-0103',
    email: 'david.b@email.com',
    children: [
      { studentId: '3', studentName: 'Olivia Brown', grade: 'Grade 9', class: 'Grade 9-B' }
    ],
    hasAccountAccess: true,
    loginMethod: 'password',
    consentGiven: true,
    createdAt: '2023-03-10',
    status: 'Active',
  },
  {
    id: '4',
    fullName: 'Jennifer Davis',
    relationship: 'Mother',
    phone: '+1-555-0104',
    email: 'jennifer.d@email.com',
    children: [
      { studentId: '4', studentName: 'Noah Davis', grade: 'Grade 11', class: 'Grade 11-A' }
    ],
    hasAccountAccess: false,
    consentGiven: true,
    createdAt: '2023-04-05',
    status: 'Active',
  },
  {
    id: '5',
    fullName: 'Robert Wilson',
    relationship: 'Father',
    phone: '+1-555-0105',
    email: 'robert.w@email.com',
    children: [
      { studentId: '5', studentName: 'Ava Wilson', grade: 'Grade 9', class: 'Grade 9-A' }
    ],
    hasAccountAccess: true,
    loginMethod: 'password',
    consentGiven: true,
    createdAt: '2023-05-12',
    status: 'Inactive',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. James Anderson',
    email: 'j.anderson@school.edu',
    phone: '+1-555-0201',
    subject: 'Mathematics',
    classes: ['Grade 10-A', 'Grade 11-A'],
    status: 'Active',
  },
  {
    id: '2',
    name: 'Ms. Emily Taylor',
    email: 'e.taylor@school.edu',
    phone: '+1-555-0202',
    subject: 'English Literature',
    classes: ['Grade 9-A', 'Grade 9-B'],
    status: 'Active',
  },
  {
    id: '3',
    name: 'Mr. Daniel Martinez',
    email: 'd.martinez@school.edu',
    phone: '+1-555-0203',
    subject: 'Science',
    classes: ['Grade 10-A', 'Grade 10-B'],
    status: 'Active',
  },
  {
    id: '4',
    name: 'Mrs. Sophie Chen',
    email: 's.chen@school.edu',
    phone: '+1-555-0204',
    subject: 'History',
    classes: ['Grade 11-A', 'Grade 11-B'],
    status: 'Active',
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    schoolName: 'Greenwood High School',
    amount: 12500,
    status: 'Paid',
    dueDate: '2024-01-01',
    paidDate: '2023-12-28',
  },
  {
    id: '2',
    schoolName: 'Riverside Academy',
    amount: 6800,
    status: 'Paid',
    dueDate: '2024-01-01',
    paidDate: '2024-01-02',
  },
  {
    id: '3',
    schoolName: 'Oakmont International',
    amount: 25000,
    status: 'Pending',
    dueDate: '2024-02-01',
  },
  {
    id: '4',
    schoolName: 'Maple Leaf Academy',
    amount: 4500,
    status: 'Overdue',
    dueDate: '2023-12-15',
  },
];

export const mockStudentPayments: Payment[] = [
  {
    id: '1',
    studentName: 'Emma Johnson',
    amount: 2500,
    status: 'Paid',
    dueDate: '2024-01-15',
    paidDate: '2024-01-10',
  },
  {
    id: '2',
    studentName: 'Liam Smith',
    amount: 2500,
    status: 'Paid',
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
  },
  {
    id: '3',
    studentName: 'Olivia Brown',
    amount: 2500,
    status: 'Pending',
    dueDate: '2024-02-15',
  },
  {
    id: '4',
    studentName: 'Ava Wilson',
    amount: 2500,
    status: 'Overdue',
    dueDate: '2024-01-15',
  },
];

export type ApplicationStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Waiting List A'
  | 'Waiting List B'
  | 'Provisionally Accepted'
  | 'Accepted'
  | 'Parent Accepted Offer'
  | 'Registered';

export interface Application {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  dateOfBirth: string;
  submittedDate: string;
  status: ApplicationStatus;
  documents: Array<{
    name: string;
    type: string;
    uploadedDate: string;
    url: string;
  }>;
  statusHistory: Array<{
    status: ApplicationStatus;
    date: string;
    message?: string;
  }>;
  previousSchool?: string;
  address: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: 'Admin' | 'School Admin' | 'Teacher' | 'Parent';
  action: string;
  details: string;
  ipAddress?: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2024-02-10 14:35:22',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'School Created',
    details: 'Created new school: Greenwood High School',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    id: '2',
    timestamp: '2024-02-10 14:30:15',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Student Added',
    details: 'Added student: Emma Johnson to Grade 10-A',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '3',
    timestamp: '2024-02-10 14:25:08',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'Invoice Generated',
    details: 'Generated invoice for Riverside Academy - R6,800',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    id: '4',
    timestamp: '2024-02-10 14:20:45',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Announcement Sent',
    details: 'Sent announcement: "Parent-Teacher Meeting" to All Parents',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '5',
    timestamp: '2024-02-10 14:15:30',
    user: 'teacher@greenwood.edu',
    userRole: 'Teacher',
    action: 'Grade Updated',
    details: 'Updated grades for Mathematics - Grade 10-A',
    ipAddress: '192.168.1.110',
    status: 'Success',
  },
  {
    id: '6',
    timestamp: '2024-02-10 14:10:20',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'School Suspended',
    details: 'Suspended school: Maple Leaf Academy due to payment issues',
    ipAddress: '192.168.1.100',
    status: 'Warning',
  },
  {
    id: '7',
    timestamp: '2024-02-10 14:05:12',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Application Status Changed',
    details: 'Changed application status for Sophia Martinez to Accepted',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '8',
    timestamp: '2024-02-10 14:00:05',
    user: 'parent@email.com',
    userRole: 'Parent',
    action: 'Payment Made',
    details: 'Paid school fees: R2,500 for Emma Johnson',
    ipAddress: '192.168.1.115',
    status: 'Success',
  },
  {
    id: '9',
    timestamp: '2024-02-10 13:55:40',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'User Login',
    details: 'Admin logged into platform',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    id: '10',
    timestamp: '2024-02-10 13:50:25',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Timetable Updated',
    details: 'Added period: Mathematics (08:00-09:00) for Class 1',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '11',
    timestamp: '2024-02-10 13:45:18',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'Login Failed',
    details: 'Failed login attempt from unknown user',
    ipAddress: '192.168.1.200',
    status: 'Failed',
  },
  {
    id: '12',
    timestamp: '2024-02-10 13:40:10',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Teacher Added',
    details: 'Added teacher: Dr. James Anderson - Mathematics',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '13',
    timestamp: '2024-02-10 13:35:05',
    user: 'teacher@greenwood.edu',
    userRole: 'Teacher',
    action: 'Attendance Marked',
    details: 'Marked attendance for Grade 10-A - 28/30 students present',
    ipAddress: '192.168.1.110',
    status: 'Success',
  },
  {
    id: '14',
    timestamp: '2024-02-10 13:30:00',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Student Updated',
    details: 'Updated contact information for Liam Smith',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    id: '15',
    timestamp: '2024-02-10 13:25:45',
    user: 'parent@email.com',
    userRole: 'Parent',
    action: 'Document Uploaded',
    details: 'Uploaded medical certificate for Emma Johnson',
    ipAddress: '192.168.1.115',
    status: 'Success',
  },
  {
    id: '16',
    timestamp: '2024-02-10 13:20:30',
    user: 'teacher@greenwood.edu',
    userRole: 'Teacher',
    action: 'Assignment Posted',
    details: 'Posted new assignment for Mathematics - Grade 10-A',
    ipAddress: '192.168.1.110',
    status: 'Success',
  },
  {
    id: '17',
    timestamp: '2024-02-09 16:45:20',
    user: 'admin@riverside.edu',
    userRole: 'School Admin',
    action: 'Event Created',
    details: 'Created event: Annual Sports Day - March 15, 2024',
    ipAddress: '192.168.1.120',
    status: 'Success',
  },
  {
    id: '18',
    timestamp: '2024-02-09 15:30:10',
    user: 'admin@platform.com',
    userRole: 'Admin',
    action: 'Plan Upgraded',
    details: 'Upgraded Greenwood High School from Basic to Premium',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    id: '19',
    timestamp: '2024-02-09 14:20:05',
    user: 'teacher@riverside.edu',
    userRole: 'Teacher',
    action: 'Report Generated',
    details: 'Generated progress report for Grade 9-A',
    ipAddress: '192.168.1.125',
    status: 'Success',
  },
  {
    id: '20',
    timestamp: '2024-02-09 13:15:40',
    user: 'admin@greenwood.edu',
    userRole: 'School Admin',
    action: 'Fee Structure Updated',
    details: 'Updated fee structure for academic year 2024-2025',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
];

export const mockApplications: Application[] = [
  {
    id: '1',
    studentName: 'Sophia Martinez',
    parentName: 'Carlos Martinez',
    email: 'carlos.m@email.com',
    phone: '+1-555-0301',
    grade: 'Grade 9',
    dateOfBirth: '2010-05-15',
    submittedDate: '2024-01-20',
    status: 'Accepted',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-20',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-20',
        url: '#',
      },
      {
        name: 'Medical Records',
        type: 'PDF',
        uploadedDate: '2024-01-20',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-20' },
      { status: 'Under Review', date: '2024-01-22', message: 'Application received and being reviewed' },
      { status: 'Accepted', date: '2024-01-28', message: 'Congratulations! Your application has been accepted.' },
    ],
    previousSchool: 'Lincoln Elementary',
    address: '123 Main St, Springfield, IL 62701',
  },
  {
    id: '2',
    studentName: 'James Thompson',
    parentName: 'Lisa Thompson',
    email: 'lisa.t@email.com',
    phone: '+1-555-0302',
    grade: 'Grade 10',
    dateOfBirth: '2009-08-22',
    submittedDate: '2024-01-18',
    status: 'Under Review',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-18',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-18',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-18' },
      { status: 'Under Review', date: '2024-01-19', message: 'Documents are being verified' },
    ],
    previousSchool: 'Washington Middle School',
    address: '456 Oak Ave, Springfield, IL 62702',
  },
  {
    id: '3',
    studentName: 'Isabella Garcia',
    parentName: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+1-555-0303',
    grade: 'Grade 8',
    dateOfBirth: '2011-03-10',
    submittedDate: '2024-01-15',
    status: 'Waiting List A',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-15',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-15' },
      { status: 'Under Review', date: '2024-01-16' },
      { status: 'Waiting List A', date: '2024-01-20', message: 'Placed on priority waiting list' },
    ],
    address: '789 Pine Rd, Springfield, IL 62703',
  },
  {
    id: '4',
    studentName: 'William Lee',
    parentName: 'David Lee',
    email: 'david.l@email.com',
    phone: '+1-555-0304',
    grade: 'Grade 11',
    dateOfBirth: '2008-11-28',
    submittedDate: '2024-01-25',
    status: 'Submitted',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-25',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-25',
        url: '#',
      },
      {
        name: 'Recommendation Letter',
        type: 'PDF',
        uploadedDate: '2024-01-25',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-25' },
    ],
    previousSchool: 'Jefferson High School',
    address: '321 Elm St, Springfield, IL 62704',
  },
  {
    id: '5',
    studentName: 'Charlotte White',
    parentName: 'Susan White',
    email: 'susan.w@email.com',
    phone: '+1-555-0305',
    grade: 'Grade 9',
    dateOfBirth: '2010-07-05',
    submittedDate: '2024-01-12',
    status: 'Parent Accepted Offer',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-12',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-12',
        url: '#',
      },
      {
        name: 'Medical Records',
        type: 'PDF',
        uploadedDate: '2024-01-12',
        url: '#',
      },
      {
        name: 'Proof of Residence',
        type: 'PDF',
        uploadedDate: '2024-01-12',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-12' },
      { status: 'Under Review', date: '2024-01-13' },
      { status: 'Provisionally Accepted', date: '2024-01-18', message: 'Pending document verification' },
      { status: 'Accepted', date: '2024-01-22', message: 'All documents verified' },
      { status: 'Parent Accepted Offer', date: '2024-01-24', message: 'Parent has accepted the admission offer' },
    ],
    previousSchool: 'Franklin Elementary',
    address: '654 Maple Dr, Springfield, IL 62705',
  },
  {
    id: '6',
    studentName: 'Benjamin Clark',
    parentName: 'Robert Clark',
    email: 'robert.c@email.com',
    phone: '+1-555-0306',
    grade: 'Grade 10',
    dateOfBirth: '2009-02-14',
    submittedDate: '2024-01-08',
    status: 'Registered',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-08',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-08',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-08' },
      { status: 'Under Review', date: '2024-01-09' },
      { status: 'Accepted', date: '2024-01-15' },
      { status: 'Parent Accepted Offer', date: '2024-01-18' },
      { status: 'Registered', date: '2024-01-22', message: 'Student has been enrolled' },
    ],
    previousSchool: 'Adams Middle School',
    address: '987 Cedar Ln, Springfield, IL 62706',
  },
  {
    id: '7',
    studentName: 'Amelia Robinson',
    parentName: 'Jennifer Robinson',
    email: 'jennifer.r@email.com',
    phone: '+1-555-0307',
    grade: 'Grade 8',
    dateOfBirth: '2011-09-30',
    submittedDate: '2024-01-22',
    status: 'Provisionally Accepted',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-22',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-22' },
      { status: 'Under Review', date: '2024-01-23' },
      { status: 'Provisionally Accepted', date: '2024-01-26', message: 'Awaiting additional documents' },
    ],
    address: '147 Birch Ave, Springfield, IL 62707',
  },
  {
    id: '8',
    studentName: 'Henry Turner',
    parentName: 'Michelle Turner',
    email: 'michelle.t@email.com',
    phone: '+1-555-0308',
    grade: 'Grade 11',
    dateOfBirth: '2008-04-18',
    submittedDate: '2024-01-17',
    status: 'Waiting List B',
    documents: [
      {
        name: 'Birth Certificate',
        type: 'PDF',
        uploadedDate: '2024-01-17',
        url: '#',
      },
      {
        name: 'Previous School Report',
        type: 'PDF',
        uploadedDate: '2024-01-17',
        url: '#',
      },
    ],
    statusHistory: [
      { status: 'Submitted', date: '2024-01-17' },
      { status: 'Under Review', date: '2024-01-18' },
      { status: 'Waiting List B', date: '2024-01-23', message: 'Placed on secondary waiting list' },
    ],
    previousSchool: 'Monroe High School',
    address: '258 Walnut St, Springfield, IL 62708',
  },
];

export const mockSchoolAdmins = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@greenwood.edu',
    school: 'Greenwood High School',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'admin@riverside.edu',
    school: 'Riverside Academy',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Mike Director',
    email: 'admin@oakmont.edu',
    school: 'Oakmont International',
    status: 'Active',
  },
];
