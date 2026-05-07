export interface StudentInterface {
    id: string;

    // --- IDENTITY ---
    fullName: string;
    middleNames: string;
    preferredName: string;
    gender: string;
    dateOfBirth: string;
    idNumber: string;
    nationality: string;
    citizenship: string;
    homeLanguage: string;
    religion: string;
    populationGroup: string;
    disabilityStatus: string;
    phone: string;
    email: string;

    // --- ACADEMICS ---
    grade: string;
    classSection: string;
    admissionYear: string;
    previousSchoolName: string;
    previousSchoolEmis: string;
    reasonForTransfer: string;
    academicHistory: string;
    promotionStatus: string;
    registeredSubjects: string[];

    // --- GUARDIANSHIP ---
    homeAddress: string;
    livingArrangement: string;
    homePhone: string;
    studentMobile: string;

    // --- EMERGENCY CONTACT (JSONB) ---
    emergencyContact: {
        fullName: string;
        relationship: string;
        phone: string;
        altPhone: string;
        address: string;
        permissionToPickUp: boolean;
    };

    // --- MEDICAL ---
    medicalAidName: string;
    medicalAidNumber: string;
    medicalAidMainMember: string;
    medicalConditions: string;
    allergies: string;
    regularMedication: string;
    doctorName: string;
    doctorPhone: string;
    emergencyTreatmentConsent: boolean;

    // --- SPECIAL NEEDS (JSONB) ---
    specialNeeds: {
        learningBarriers: string;
        physicalDisabilities: string;
        supportServices: string;
        concessionRequirements: string;
    };

    // --- TRANSPORT (JSONB) ---
    transport: {
        mode: string;
        provider: string;
        vehicleDetails: string;
        pickupLocation: string;
        afterSchoolArrangement: string;
    };

    // --- FINANCE ---
    feeCategory: string;
    billingGuardian: string;
    paymentStatus: string;
    outstandingBalance: string;

    // --- DOCUMENT FLAGS (JSONB) ---
    documents: {
        birthCertificate: boolean;
        idPassport: boolean;
        immunizationCard: boolean;
        previousSchoolReport: boolean;
        proofOfAddress: boolean;
        medicalAidCard: boolean;
    };
}