export interface SchoolPayload {
    name: string;
    address: string;
    province: string;
    municipality: string;
    type: string;
    tenant_id: string;
    contactNumber: string;
    email: string;
    website: string;
    annualFees: number;
    admissionRequirements: string;
    passRate: number;
    imageUrl?: string;
    phase: string[];
    gradesOffered: string[];
    facilities: string[];
    subjects: {
        name: string;
        code: string;
    }[];
}