import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CreateStudentProfileDto {
    // --- REQUIRED ---
    schoolId: string;
    idNumber: string;

    // --- IDENTITY ---
    fullName?: string;
    middleNames?: string;
    preferredName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    citizenship?: string;
    homeLanguage?: string;
    religion?: string;
    populationGroup?: string;
    disabilityStatus?: string;
    phone?: string;
    email?: string;

    // --- ACADEMICS ---
    grade?: string;
    classSection?: string;
    admissionYear?: string;

    // --- RELATIONS ---
    userId?: string;
    parentProfileId?: string;
}

export const createStudentProfile = (data: CreateStudentProfileDto) =>
    axios.post(`${baseUrl}/students/create-student-profile`, data, {
        headers: { 'Content-Type': 'application/json', ...authHeader() },
    });

export const bulkCreateStudentProfiles = (students: CreateStudentProfileDto[]) =>
    Promise.all(students.map((s) => createStudentProfile(s)));

/**
 * Resolves a parent's national ID number → their profile UUID.
 * Calls GET /parents/lookup?idNumber=xxx
 * Returns the parentProfile UUID string, or null if not found.
 */
export const lookupParentByIdNumber = async (idNumber: string): Promise<string | null> => {
    try {
        const res = await axios.get(`${baseUrl}/parents/lookup`, {
            params: { idNumber },
            headers: authHeader(),
        });
        return res.data?.id ?? null;
    } catch {
        return null;
    }
};

export const lookupStudentByIdNumber = async (idNumber: string) => {
    const res = await axios.get(`${baseUrl}/students/lookup`, {
        params: { idNumber },
        headers: authHeader(),
    });
    return res.data;
};
