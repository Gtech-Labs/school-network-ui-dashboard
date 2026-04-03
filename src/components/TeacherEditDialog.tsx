import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Teacher } from '@/lib/mockData';

interface TeacherEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
  onSave: (data: TeacherFormData) => void;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string;
  status: string;
  idNumber: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  homeAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  qualifications: string;
  yearsOfExperience: string;
  previousSchool: string;
  specializations: string;
  certifications: string;
  employmentType: string;
  startDate: string;
  contractEndDate: string;
  salary: string;
  bankName: string;
  accountNumber: string;
}

const STEPS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'contact', label: 'Contact' },
  { id: 'qualifications', label: 'Qualifications' },
  { id: 'employment', label: 'Employment' },
];

export default function TeacherEditDialog({ open, onOpenChange, teacher, onSave }: TeacherEditDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TeacherFormData>({
    name: teacher.name || '',
    email: teacher.email || '',
    phone: teacher.phone || '',
    subject: teacher.subject || '',
    classes: teacher.classes?.join(', ') || '',
    status: teacher.status || 'Active',
    idNumber: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    homeAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    qualifications: '',
    yearsOfExperience: '',
    previousSchool: '',
    specializations: '',
    certifications: '',
    employmentType: 'Full-time',
    startDate: '',
    contractEndDate: '',
    salary: '',
    bankName: '',
    accountNumber: '',
  });

  const handleChange = (field: keyof TeacherFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input value={formData.idNumber} onChange={(e) => handleChange('idNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Home Address</Label>
              <Input value={formData.homeAddress} onChange={(e) => handleChange('homeAddress', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input value={formData.emergencyContactName} onChange={(e) => handleChange('emergencyContactName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input value={formData.emergencyContactPhone} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} />
            </div>
          </div>
        );
      case 'qualifications':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Classes (comma separated)</Label>
              <Input value={formData.classes} onChange={(e) => handleChange('classes', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input value={formData.qualifications} onChange={(e) => handleChange('qualifications', e.target.value)} placeholder="e.g. B.Ed, M.Sc" />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input value={formData.yearsOfExperience} onChange={(e) => handleChange('yearsOfExperience', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Previous School</Label>
              <Input value={formData.previousSchool} onChange={(e) => handleChange('previousSchool', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <Input value={formData.specializations} onChange={(e) => handleChange('specializations', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Certifications</Label>
              <Input value={formData.certifications} onChange={(e) => handleChange('certifications', e.target.value)} placeholder="e.g. PGCE, SACE registered" />
            </div>
          </div>
        );
      case 'employment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={formData.employmentType} onValueChange={(v) => handleChange('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Substitute">Substitute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contract End Date</Label>
              <Input type="date" value={formData.contractEndDate} onChange={(e) => handleChange('contractEndDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input value={formData.salary} onChange={(e) => handleChange('salary', e.target.value)} placeholder="e.g. R25,000" />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher Information</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              className={cn(
                'flex-1 text-xs font-medium py-2 px-1 rounded-md text-center transition-colors',
                i === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="min-h-[250px]">{renderStep()}</div>

        <div className="flex justify-between mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep((p) => Math.max(p - 1, 0))} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep((p) => p + 1)}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave}>Save Changes</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
