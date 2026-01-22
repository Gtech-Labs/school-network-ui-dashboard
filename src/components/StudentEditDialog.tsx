import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  feesPaid: number;
  status: string;
}

interface StudentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  onSave: (data: StudentFormData) => void;
}

export interface StudentFormData {
  // Identity
  firstName: string;
  surname: string;
  middleName: string;
  preferredName: string;
  gender: string;
  dateOfBirth: string;
  idNumber: string;
  citizenship: string;
  nationality: string;
  homeLanguage: string;
  religion: string;
  populationGroup: string;
  disabilityStatus: string;
  // Guardianship
  homeAddress: string;
  livingArrangement: string;
  homePhone: string;
  studentMobile: string;
  studentEmail: string;
  parent1Name: string;
  parent1Relationship: string;
  parent1IdNumber: string;
  parent1PrimaryPhone: string;
  parent1SecondaryPhone: string;
  parent1Email: string;
  parent1EmploymentStatus: string;
  parent1Employer: string;
  parent1Occupation: string;
  parent1ResponsibleForFees: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAltPhone: string;
  emergencyContactAddress: string;
  emergencyContactPickupPermission: string;
  // Academics
  currentGrade: string;
  classSection: string;
  admissionYear: string;
  previousSchoolName: string;
  previousSchoolEmis: string;
  reasonForTransfer: string;
  academicHistory: string;
  promotionStatus: string;
  registeredSubjects: string;
  subjectChoices: string;
  curriculumType: string;
  // Wellness
  medicalAidName: string;
  medicalAidNumber: string;
  mainMemberName: string;
  medicalConditions: string;
  allergies: string;
  regularMedication: string;
  doctorName: string;
  doctorPhone: string;
  emergencyTreatmentConsent: string;
  learningBarriers: string;
  physicalDisabilities: string;
  supportServicesNeeded: string;
  concessionRequirements: string;
  individualSupportPlan: string;
  // Conduct
  behaviourNotes: string;
  incidentReports: string;
  meritDemeritRecords: string;
  suspensionHistory: string;
  dailyAttendance: string;
  absenceReasons: string;
  lateArrivals: string;
  absenceAlerts: string;
  // Finance
  feeCategory: string;
  billingGuardian: string;
  paymentStatus: string;
  outstandingBalance: string;
  discounts: string;
  paymentPlan: string;
  // Portfolio
  transportMode: string;
  pickupPoint: string;
  busRoute: string;
  transportProvider: string;
  extracurricularActivities: string;
  sportsTeams: string;
  clubsMembership: string;
  achievementsAwards: string;
}

const STEPS = [
  { id: 'identity', label: 'Identity' },
  { id: 'guardianship', label: 'Guardianship' },
  { id: 'academics', label: 'Academics' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'conduct', label: 'Conduct' },
  { id: 'finance', label: 'Finance' },
  { id: 'portfolio', label: 'Portfolio' },
];

export default function StudentEditDialog({ open, onOpenChange, student, onSave }: StudentEditDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StudentFormData>({
    // Pre-populate with existing data
    firstName: student.name.split(' ')[0] || '',
    surname: student.name.split(' ').slice(1).join(' ') || '',
    middleName: '',
    preferredName: '',
    gender: '',
    dateOfBirth: '',
    idNumber: '',
    citizenship: '',
    nationality: '',
    homeLanguage: '',
    religion: '',
    populationGroup: '',
    disabilityStatus: '',
    homeAddress: '',
    livingArrangement: '',
    homePhone: '',
    studentMobile: '',
    studentEmail: student.email || '',
    parent1Name: student.parentName || '',
    parent1Relationship: '',
    parent1IdNumber: '',
    parent1PrimaryPhone: student.parentPhone || '',
    parent1SecondaryPhone: '',
    parent1Email: student.parentEmail || '',
    parent1EmploymentStatus: '',
    parent1Employer: '',
    parent1Occupation: '',
    parent1ResponsibleForFees: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactAltPhone: '',
    emergencyContactAddress: '',
    emergencyContactPickupPermission: '',
    currentGrade: student.class || '',
    classSection: student.class || '',
    admissionYear: '',
    previousSchoolName: '',
    previousSchoolEmis: '',
    reasonForTransfer: '',
    academicHistory: '',
    promotionStatus: '',
    registeredSubjects: '',
    subjectChoices: '',
    curriculumType: '',
    medicalAidName: '',
    medicalAidNumber: '',
    mainMemberName: '',
    medicalConditions: '',
    allergies: '',
    regularMedication: '',
    doctorName: '',
    doctorPhone: '',
    emergencyTreatmentConsent: '',
    learningBarriers: '',
    physicalDisabilities: '',
    supportServicesNeeded: '',
    concessionRequirements: '',
    individualSupportPlan: '',
    behaviourNotes: '',
    incidentReports: '',
    meritDemeritRecords: '',
    suspensionHistory: '',
    dailyAttendance: '',
    absenceReasons: '',
    lateArrivals: '',
    absenceAlerts: '',
    feeCategory: '',
    billingGuardian: student.parentName || '',
    paymentStatus: `${student.feesPaid}%`,
    outstandingBalance: '',
    discounts: '',
    paymentPlan: '',
    transportMode: '',
    pickupPoint: '',
    busRoute: '',
    transportProvider: '',
    extracurricularActivities: '',
    sportsTeams: '',
    clubsMembership: '',
    achievementsAwards: '',
  });

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'identity':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" value={formData.surname} onChange={(e) => handleInputChange('surname', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name(s)</Label>
              <Input id="middleName" value={formData.middleName} onChange={(e) => handleInputChange('middleName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input id="preferredName" value={formData.preferredName} onChange={(e) => handleInputChange('preferredName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number / Birth Certificate</Label>
              <Input id="idNumber" value={formData.idNumber} onChange={(e) => handleInputChange('idNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citizenship">Citizenship</Label>
              <Input id="citizenship" value={formData.citizenship} onChange={(e) => handleInputChange('citizenship', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" value={formData.nationality} onChange={(e) => handleInputChange('nationality', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeLanguage">Home Language</Label>
              <Input id="homeLanguage" value={formData.homeLanguage} onChange={(e) => handleInputChange('homeLanguage', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <Input id="religion" value={formData.religion} onChange={(e) => handleInputChange('religion', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="populationGroup">Population Group</Label>
              <Input id="populationGroup" value={formData.populationGroup} onChange={(e) => handleInputChange('populationGroup', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="disabilityStatus">Disability Status</Label>
              <Select value={formData.disabilityStatus} onValueChange={(value) => handleInputChange('disabilityStatus', value)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="hearing">Hearing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'guardianship':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <Textarea id="homeAddress" value={formData.homeAddress} onChange={(e) => handleInputChange('homeAddress', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="livingArrangement">Living Arrangement</Label>
                  <Input id="livingArrangement" value={formData.livingArrangement} onChange={(e) => handleInputChange('livingArrangement', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homePhone">Home Phone</Label>
                  <Input id="homePhone" value={formData.homePhone} onChange={(e) => handleInputChange('homePhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentMobile">Student Mobile</Label>
                  <Input id="studentMobile" value={formData.studentMobile} onChange={(e) => handleInputChange('studentMobile', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Student Email</Label>
                  <Input id="studentEmail" type="email" value={formData.studentEmail} onChange={(e) => handleInputChange('studentEmail', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Parent/Guardian 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent1Name">Full Name</Label>
                  <Input id="parent1Name" value={formData.parent1Name} onChange={(e) => handleInputChange('parent1Name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Relationship">Relationship</Label>
                  <Select value={formData.parent1Relationship} onValueChange={(value) => handleInputChange('parent1Relationship', value)}>
                    <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1IdNumber">ID Number / Passport</Label>
                  <Input id="parent1IdNumber" value={formData.parent1IdNumber} onChange={(e) => handleInputChange('parent1IdNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1PrimaryPhone">Primary Phone</Label>
                  <Input id="parent1PrimaryPhone" value={formData.parent1PrimaryPhone} onChange={(e) => handleInputChange('parent1PrimaryPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Email">Email Address</Label>
                  <Input id="parent1Email" type="email" value={formData.parent1Email} onChange={(e) => handleInputChange('parent1Email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Occupation">Occupation</Label>
                  <Input id="parent1Occupation" value={formData.parent1Occupation} onChange={(e) => handleInputChange('parent1Occupation', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Full Name</Label>
                  <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={(e) => handleInputChange('emergencyContactName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input id="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                  <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactAltPhone">Alternative Phone</Label>
                  <Input id="emergencyContactAltPhone" value={formData.emergencyContactAltPhone} onChange={(e) => handleInputChange('emergencyContactAltPhone', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'academics':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentGrade">Current Grade</Label>
                  <Input id="currentGrade" value={formData.currentGrade} onChange={(e) => handleInputChange('currentGrade', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classSection">Class/Section</Label>
                  <Input id="classSection" value={formData.classSection} onChange={(e) => handleInputChange('classSection', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionYear">Admission Year</Label>
                  <Input id="admissionYear" value={formData.admissionYear} onChange={(e) => handleInputChange('admissionYear', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchoolName">Previous School Name</Label>
                  <Input id="previousSchoolName" value={formData.previousSchoolName} onChange={(e) => handleInputChange('previousSchoolName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchoolEmis">Previous School EMIS</Label>
                  <Input id="previousSchoolEmis" value={formData.previousSchoolEmis} onChange={(e) => handleInputChange('previousSchoolEmis', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reasonForTransfer">Reason for Transfer</Label>
                  <Input id="reasonForTransfer" value={formData.reasonForTransfer} onChange={(e) => handleInputChange('reasonForTransfer', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="academicHistory">Academic History</Label>
                  <Textarea id="academicHistory" value={formData.academicHistory} onChange={(e) => handleInputChange('academicHistory', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotionStatus">Promotion Status</Label>
                  <Select value={formData.promotionStatus} onValueChange={(value) => handleInputChange('promotionStatus', value)}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promoted">Promoted</SelectItem>
                      <SelectItem value="retained">Retained</SelectItem>
                      <SelectItem value="conditional">Conditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculumType">Curriculum Type</Label>
                  <Select value={formData.curriculumType} onValueChange={(value) => handleInputChange('curriculumType', value)}>
                    <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caps">CAPS</SelectItem>
                      <SelectItem value="ibe">IBE</SelectItem>
                      <SelectItem value="cambridge">Cambridge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Subjects</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registeredSubjects">Registered Subjects</Label>
                  <Textarea id="registeredSubjects" placeholder="Enter subjects, separated by commas" value={formData.registeredSubjects} onChange={(e) => handleInputChange('registeredSubjects', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectChoices">Subject Choices</Label>
                  <Textarea id="subjectChoices" placeholder="Enter subject choices" value={formData.subjectChoices} onChange={(e) => handleInputChange('subjectChoices', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'wellness':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Medical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalAidName">Medical Aid Name</Label>
                  <Input id="medicalAidName" value={formData.medicalAidName} onChange={(e) => handleInputChange('medicalAidName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalAidNumber">Medical Aid Number</Label>
                  <Input id="medicalAidNumber" value={formData.medicalAidNumber} onChange={(e) => handleInputChange('medicalAidNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainMemberName">Main Member Name</Label>
                  <Input id="mainMemberName" value={formData.mainMemberName} onChange={(e) => handleInputChange('mainMemberName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input id="doctorName" value={formData.doctorName} onChange={(e) => handleInputChange('doctorName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorPhone">Doctor Phone</Label>
                  <Input id="doctorPhone" value={formData.doctorPhone} onChange={(e) => handleInputChange('doctorPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyTreatmentConsent">Emergency Treatment Consent</Label>
                  <Select value={formData.emergencyTreatmentConsent} onValueChange={(value) => handleInputChange('emergencyTreatmentConsent', value)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea id="medicalConditions" value={formData.medicalConditions} onChange={(e) => handleInputChange('medicalConditions', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea id="allergies" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="regularMedication">Regular Medication</Label>
                  <Textarea id="regularMedication" value={formData.regularMedication} onChange={(e) => handleInputChange('regularMedication', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Special Needs / Support</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="learningBarriers">Learning Barriers</Label>
                  <Textarea id="learningBarriers" value={formData.learningBarriers} onChange={(e) => handleInputChange('learningBarriers', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicalDisabilities">Physical Disabilities</Label>
                  <Textarea id="physicalDisabilities" value={formData.physicalDisabilities} onChange={(e) => handleInputChange('physicalDisabilities', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportServicesNeeded">Support Services Needed</Label>
                  <Textarea id="supportServicesNeeded" value={formData.supportServicesNeeded} onChange={(e) => handleInputChange('supportServicesNeeded', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concessionRequirements">Concession Requirements</Label>
                  <Textarea id="concessionRequirements" value={formData.concessionRequirements} onChange={(e) => handleInputChange('concessionRequirements', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'conduct':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Behaviour & Discipline</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="behaviourNotes">Behaviour Notes</Label>
                  <Textarea id="behaviourNotes" value={formData.behaviourNotes} onChange={(e) => handleInputChange('behaviourNotes', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incidentReports">Incident Reports</Label>
                  <Textarea id="incidentReports" value={formData.incidentReports} onChange={(e) => handleInputChange('incidentReports', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meritDemeritRecords">Merit / Demerit Records</Label>
                  <Textarea id="meritDemeritRecords" value={formData.meritDemeritRecords} onChange={(e) => handleInputChange('meritDemeritRecords', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suspensionHistory">Suspension/Expulsion History</Label>
                  <Textarea id="suspensionHistory" value={formData.suspensionHistory} onChange={(e) => handleInputChange('suspensionHistory', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Attendance Records</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyAttendance">Daily Attendance</Label>
                  <Input id="dailyAttendance" value={formData.dailyAttendance} onChange={(e) => handleInputChange('dailyAttendance', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateArrivals">Late Arrivals</Label>
                  <Input id="lateArrivals" value={formData.lateArrivals} onChange={(e) => handleInputChange('lateArrivals', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="absenceReasons">Absence Reasons</Label>
                  <Textarea id="absenceReasons" value={formData.absenceReasons} onChange={(e) => handleInputChange('absenceReasons', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="absenceAlerts">Absence Alerts</Label>
                  <Textarea id="absenceAlerts" value={formData.absenceAlerts} onChange={(e) => handleInputChange('absenceAlerts', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feeCategory">Fee Category</Label>
              <Select value={formData.feeCategory} onValueChange={(value) => handleInputChange('feeCategory', value)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Fee</SelectItem>
                  <SelectItem value="partial">Partial Exemption</SelectItem>
                  <SelectItem value="exempt">Full Exemption</SelectItem>
                  <SelectItem value="bursary">Bursary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingGuardian">Billing Guardian</Label>
              <Input id="billingGuardian" value={formData.billingGuardian} onChange={(e) => handleInputChange('billingGuardian', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Input id="paymentStatus" value={formData.paymentStatus} onChange={(e) => handleInputChange('paymentStatus', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outstandingBalance">Outstanding Balance</Label>
              <Input id="outstandingBalance" value={formData.outstandingBalance} onChange={(e) => handleInputChange('outstandingBalance', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discounts">Discounts</Label>
              <Input id="discounts" value={formData.discounts} onChange={(e) => handleInputChange('discounts', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentPlan">Payment Plan</Label>
              <Select value={formData.paymentPlan} onValueChange={(value) => handleInputChange('paymentPlan', value)}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Transport Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportMode">Transport Mode</Label>
                  <Select value={formData.transportMode} onValueChange={(value) => handleInputChange('transportMode', value)}>
                    <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_bus">School Bus</SelectItem>
                      <SelectItem value="private">Private Vehicle</SelectItem>
                      <SelectItem value="public">Public Transport</SelectItem>
                      <SelectItem value="walk">Walking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupPoint">Pickup Point</Label>
                  <Input id="pickupPoint" value={formData.pickupPoint} onChange={(e) => handleInputChange('pickupPoint', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busRoute">Bus Route</Label>
                  <Input id="busRoute" value={formData.busRoute} onChange={(e) => handleInputChange('busRoute', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportProvider">Transport Provider</Label>
                  <Input id="transportProvider" value={formData.transportProvider} onChange={(e) => handleInputChange('transportProvider', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Extracurricular Activities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="extracurricularActivities">Activities</Label>
                  <Textarea id="extracurricularActivities" value={formData.extracurricularActivities} onChange={(e) => handleInputChange('extracurricularActivities', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sportsTeams">Sports Teams</Label>
                  <Input id="sportsTeams" value={formData.sportsTeams} onChange={(e) => handleInputChange('sportsTeams', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubsMembership">Clubs Membership</Label>
                  <Input id="clubsMembership" value={formData.clubsMembership} onChange={(e) => handleInputChange('clubsMembership', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="achievementsAwards">Achievements & Awards</Label>
                  <Textarea id="achievementsAwards" value={formData.achievementsAwards} onChange={(e) => handleInputChange('achievementsAwards', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Student: {student.name}</DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center justify-between px-2 py-4 border-b overflow-x-auto">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                index === currentStep
                  ? "bg-primary-foreground text-primary"
                  : index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/30"
              )}>
                {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden md:inline">{step.label}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="rounded-lg"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>

          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSave} className="rounded-lg">
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleNext} className="rounded-lg">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
