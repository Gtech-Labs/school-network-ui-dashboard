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
import { ChevronLeft, ChevronRight, X, Plus, User, Phone, Users, KeyRound, Shield, Search, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { lookupStudentByIdNumber } from '@/api/students.api';
import { getUserByEmail } from '@/api/users.api';
import { useCreateParent, useUpdateParent } from '@/hooks/users/parent.hook';
import { toast } from 'sonner';
import { Parent } from '@/pages/interfaces/parent.interface';
import { useAuth } from '@/context/AuthContext';


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
    address: '',
    occupation: '',
    idNumber: '',
    children: [] as ChildLink[],
    hasAccountAccess: false,
    loginMethod: 'password' as 'password' | 'otp',
    password: '',
    consentGiven: false,
    accountStatus: 'Active',
  });

  // Child linking state
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const { mutateAsync: createParent, isPending: isCreating } = useCreateParent();
  const { mutateAsync: updateParent, isPending: isUpdating } = useUpdateParent(parent?.id || '');

  const isPending = isCreating || isUpdating;
  const { user: authUser } = useAuth();
  const schoolId = authUser?.tenant_id || '';


  useEffect(() => {
    if (parent && mode === 'edit') {
      setFormData({
        fullName: parent.fullName || '',
        relationship: parent.relationship || 'Father',
        phone: parent.phone || '',
        email: parent.email || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
        idNumber: parent.idNumber || '',
        children: parent.students ? parent.students.map((s: any) => ({
          studentId: s.studentId || s.id,
          studentName: s.fullName || s.name,
          grade: s.grade,
          class: s.class || s.classSection || s.grade,
        })) : [],
        hasAccountAccess: parent.hasAccountAccess || false,
        loginMethod: parent.loginMethod || 'password',
        password: '',
        consentGiven: parent.consentGiven || false,
        accountStatus: parent.status || 'Active',
      });
    } else {
      setFormData({
        fullName: '',
        relationship: 'Father',
        phone: '',
        email: '',
        address: '',
        occupation: '',
        idNumber: '',
        children: [],
        hasAccountAccess: false,
        loginMethod: 'password',
        password: '',
        consentGiven: false,
        accountStatus: 'Active',
      });
    }
    setCurrentStep(1);
  }, [parent, mode, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkStudent = async () => {
    if (!studentIdInput) return;
    setIsLinking(true);
    try {
      const student = await lookupStudentByIdNumber(studentIdInput);
      if (!student) {
        toast.error("Student not found");
        return;
      }

      // Check if already linked
      if (formData.children.some((c) => c.studentId === student.id)) {
        toast.error("Student already linked");
        return;
      }

      const newChild: ChildLink = {
        studentId: student.id,
        studentName: student.fullName,
        grade: student.grade,
        class: student.classSection || student.grade,
      };

      setFormData((prev) => ({
        ...prev,
        children: [...prev.children, newChild],
      }));
      setStudentIdInput('');
      toast.success(`Linked ${student.fullName}`);
    } catch (error) {
      toast.error("Error finding student. Please check the ID number.");
    } finally {
      setIsLinking(false);
    }
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

  const handleSave = async () => {
    try {
      let userId = '';

      if (mode === 'add') {
        if (!formData.email) {
          toast.error("Email is required to link parent to a user");
          return;
        }

        try {
          const userRes = await getUserByEmail(formData.email);
          userId = userRes.data.id;
        } catch (err) {
          toast.error("No user found with this email. Please create the user first.");
          return;
        }
      }

      const payload = {
        userId: userId || undefined,
        fullName: formData.fullName,
        address: formData.address,
        occupation: formData.occupation,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email,
        accountStatus: formData.accountStatus,
        consentGiven: formData.consentGiven,
        idNumber: formData.idNumber,
        childrenIds: formData.children.map(c => c.studentId),
        schoolId: mode === 'add' ? schoolId : undefined,
      };

      if (mode === 'add') {
        await createParent(payload as any);
        toast.success("Parent created successfully");
      } else {
        await updateParent(payload as any);
        toast.success("Parent updated successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save parent profile");
    }
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



  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">National ID Number *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                placeholder="Enter ID number"
              />
            </div>
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="parent@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="e.g. Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Residential Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, Johannesburg"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Child by ID Number *</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Enter Student ID Number (e.g. 1234567890123)"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkStudent();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleLinkStudent}
                  disabled={!studentIdInput || isLinking}
                >
                  {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link now'}
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep === step.id
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
                    className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
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
            <Button onClick={handleSave} disabled={!isStepValid() || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'Add Parent' : 'Save Changes'}
            </Button>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
