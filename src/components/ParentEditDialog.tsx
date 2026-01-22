import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, Plus, User, Phone, Users, KeyRound, Shield } from 'lucide-react';
import { Parent, mockStudents } from '@/lib/mockData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ParentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent?: Parent | null;
  onSave: (data: Partial<Parent>) => void;
  mode: 'add' | 'edit';
}

interface ChildLink {
  studentId: string;
  studentName: string;
  schoolId?: string;
  grade: string;
  class: string;
}

const STEPS = [
  { id: 1, title: 'Basic Identity', icon: User },
  { id: 2, title: 'Contact Information', icon: Phone },
  { id: 3, title: 'Child Linking', icon: Users },
  { id: 4, title: 'Account Access', icon: KeyRound },
  { id: 5, title: 'Consent', icon: Shield },
];

export function ParentEditDialog({ open, onOpenChange, parent, onSave, mode }: ParentEditDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: 'Father' as 'Mother' | 'Father' | 'Guardian',
    phone: '',
    email: '',
    children: [] as ChildLink[],
    hasAccountAccess: false,
    loginMethod: 'password' as 'password' | 'otp',
    password: '',
    consentGiven: false,
  });

  // Child linking state
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    if (parent && mode === 'edit') {
      setFormData({
        fullName: parent.fullName || '',
        relationship: parent.relationship || 'Father',
        phone: parent.phone || '',
        email: parent.email || '',
        children: parent.children || [],
        hasAccountAccess: parent.hasAccountAccess || false,
        loginMethod: parent.loginMethod || 'password',
        password: '',
        consentGiven: parent.consentGiven || false,
      });
    } else {
      setFormData({
        fullName: '',
        relationship: 'Father',
        phone: '',
        email: '',
        children: [],
        hasAccountAccess: false,
        loginMethod: 'password',
        password: '',
        consentGiven: false,
      });
    }
    setCurrentStep(1);
  }, [parent, mode, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddChild = () => {
    if (!selectedStudent) return;
    const student = mockStudents.find((s) => s.id === selectedStudent);
    if (!student) return;

    // Check if already linked
    if (formData.children.some((c) => c.studentId === student.id)) return;

    const gradeMatch = student.class.match(/Grade (\d+)/);
    const grade = gradeMatch ? `Grade ${gradeMatch[1]}` : student.class;

    const newChild: ChildLink = {
      studentId: student.id,
      studentName: student.name,
      grade,
      class: student.class,
    };

    setFormData((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));
    setSelectedStudent('');
  };

  const handleRemoveChild = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.studentId !== studentId),
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      id: parent?.id || `${Date.now()}`,
      createdAt: parent?.createdAt || new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    onOpenChange(false);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== '';
      case 2:
        return formData.phone.trim() !== '';
      case 3:
        return formData.children.length > 0;
      case 4:
        if (!formData.hasAccountAccess) return true;
        if (formData.loginMethod === 'password') return formData.password.length >= 6;
        return true;
      case 5:
        return formData.consentGiven;
      default:
        return true;
    }
  };

  const availableStudents = mockStudents.filter(
    (s) => !formData.children.some((c) => c.studentId === s.id)
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter parent's full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship to Child *</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => handleInputChange('relationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Primary) *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+27 XX XXX XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="parent@example.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Children *</Label>
              <div className="flex gap-2">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddChild} disabled={!selectedStudent}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.children.length > 0 && (
              <div className="space-y-2">
                <Label>Linked Children</Label>
                <div className="space-y-2">
                  {formData.children.map((child) => (
                    <div
                      key={child.studentId}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{child.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {child.grade} • {child.class}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChild(child.studentId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.children.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No children linked yet. Please select and add at least one child.
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasAccountAccess"
                checked={formData.hasAccountAccess}
                onCheckedChange={(checked) => handleInputChange('hasAccountAccess', checked)}
              />
              <Label htmlFor="hasAccountAccess">Enable account access for this parent</Label>
            </div>

            {formData.hasAccountAccess && (
              <>
                <div className="space-y-2">
                  <Label>Login Method</Label>
                  <RadioGroup
                    value={formData.loginMethod}
                    onValueChange={(value) => handleInputChange('loginMethod', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="password" id="password" />
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="otp" id="otp" />
                      <Label htmlFor="otp">OTP via Phone Number</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.loginMethod === 'password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Set Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                    {formData.password && formData.password.length < 6 && (
                      <p className="text-sm text-destructive">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>
                )}

                {formData.loginMethod === 'otp' && (
                  <p className="text-sm text-muted-foreground">
                    Parent will receive a one-time password via SMS to {formData.phone || 'their phone number'}.
                  </p>
                )}
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Data Processing Consent</h4>
              <p className="text-sm text-muted-foreground mb-4">
                By checking the box below, the parent consents to the storage and processing of their personal data 
                and agrees to receive notifications regarding their child's education, including announcements, 
                academic updates, and administrative communications.
              </p>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consentGiven}
                  onCheckedChange={(checked) => handleInputChange('consentGiven', checked)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I consent to store data and receive notifications *
                </Label>
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Parent' : 'Edit Parent'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : currentStep > step.id
                      ? 'bg-primary/20 text-primary border-primary'
                      : 'bg-muted text-muted-foreground border-muted'
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{STEPS[currentStep - 1].title}</h3>
          <p className="text-sm text-muted-foreground">Step {currentStep} of 5</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!isStepValid()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!isStepValid()}>
              {mode === 'add' ? 'Add Parent' : 'Save Changes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
