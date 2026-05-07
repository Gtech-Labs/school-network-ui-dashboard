export interface ChildLink {
    studentId: string;
    studentName: string;
    grade: string;
    class: string;
}

export interface Parent {
    id: string;
    fullName: string;
    relationship: string;
    phone: string;
    email?: string;
    status: string;
    createdAt: string;
    children: ChildLink[];
    hasAccountAccess?: boolean;
    loginMethod?: 'password' | 'otp';
    consentGiven?: boolean;
    address?: string;
    occupation?: string;
    idNumber?: string;
    userId?: string;
    students?: any[]; // for backend response which might use different naming
}
