import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockStudents } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StudentEditDialog, { StudentFormData } from '@/components/StudentEditDialog';
import { toast } from 'sonner';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find((s) => s.id === id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!student) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/school/students')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Student not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/school/students')} className="rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{student.name}</h2>
            <p className="text-muted-foreground">{student.class}</p>
          </div>
          <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
            {student.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={() => setSuspendDialogOpen(true)}>
            <UserX className="mr-2 h-4 w-4" />
            Suspend
          </Button>
          <Button variant="destructive" className="rounded-lg" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <StudentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={student}
        onSave={(data: StudentFormData) => {
          console.log('Saving student data:', data);
          toast.success('Student information updated successfully');
        }}
      />

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {student.name}? This will temporarily disable their access to school resources. You can reactivate them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${student.name} has been suspended`);
                setSuspendDialogOpen(false);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Suspend Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {student.name}? This action cannot be undone. All associated records, documents, and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${student.name} has been deleted`);
                setDeleteDialogOpen(false);
                navigate('/school/students');
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tabs */}
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="guardianship">Guardianship</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="conduct">Conduct</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Tab 1: Identity */}
        <TabsContent value="identity">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="pb-4 border-b">
                <h3 className="text-xl font-semibold mb-2">Identity</h3>
                <p className="text-sm text-muted-foreground">Personal and demographic details</p>
              </div>
              <div className="space-y-0 border rounded-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">First Name</label>
                    <p className="text-base font-medium mt-1">{student.name.split(' ')[0]}</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Surname</label>
                    <p className="text-base font-medium mt-1">{student.name.split(' ').slice(1).join(' ')}</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Middle Name(s)</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preferred Name</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Number / Birth Certificate</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Citizenship</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nationality</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Home Language</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Religion</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Population Group</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Disability Status</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Guardianship */}
        <TabsContent value="guardianship">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Guardianship</h3>
                <p className="text-sm text-muted-foreground">Parents, household, and emergency contacts</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Contact Information</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Home Address</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Living Arrangement</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Home Phone</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Student Mobile</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                      <p className="text-base font-medium mt-1">{student.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian 1 */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Parent/Guardian 1</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                      <p className="text-base font-medium mt-1">{student.parentName}</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Number / Passport</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Primary Phone</label>
                      <p className="text-base font-medium mt-1">{student.parentPhone}</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Secondary Phone</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Address</label>
                      <p className="text-base font-medium mt-1">{student.parentEmail}</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employment Status</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employer Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Occupation</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsible for Fees</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian 2 */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Parent/Guardian 2</h4>
                <div className="bg-muted/30 p-4">
                  <p className="text-muted-foreground italic">Not provided</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg px-4">Emergency Contact</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone Number</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alternative Phone</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permission to Pick Up</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Academics */}
        <TabsContent value="academics">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Academics</h3>
                <p className="text-sm text-muted-foreground">Grades, subjects, curriculum, and performance</p>
              </div>

              {/* Academic Information */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Academic Information</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Grade</label>
                      <p className="text-base font-medium mt-1">{student.class}</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Class/Section</label>
                      <p className="text-base font-medium mt-1">{student.class}</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admission Year</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Previous School Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Previous School EMIS</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reason for Transfer</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic History</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Promotion Status</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg px-4">Subjects</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered Subjects</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject Choices</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Curriculum Type</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Wellness */}
        <TabsContent value="wellness">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Wellness</h3>
                <p className="text-sm text-muted-foreground">Medical, health, and support needs</p>
              </div>

              {/* Medical Information */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Medical Information</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical Aid Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical Aid Number</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Main Member Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical Conditions</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Allergies</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Regular Medication</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Doctor Name</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Doctor Phone</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emergency Treatment Consent</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Needs / Support */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg px-4">Special Needs / Support Information</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1">
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learning Barriers</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Physical Disabilities</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Support Services Needed</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Concession Requirements</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Individual Support Plan</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Conduct */}
        <TabsContent value="conduct">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Conduct</h3>
                <p className="text-sm text-muted-foreground">Behaviour, discipline, attendance, and welfare</p>
              </div>

              {/* Behaviour & Discipline */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Behaviour & Discipline Records</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1">
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Behaviour Notes</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No records available</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Incident Reports</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No incidents reported</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Merit / Demerit Records</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No records available</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suspension/Expulsion History</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No history</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg px-4">Attendance Records</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1">
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Attendance</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No records available</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Absence Reasons</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No absences recorded</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Late Arrivals</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No late arrivals</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Absence Alerts</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No alerts sent</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Finance */}
        <TabsContent value="finance">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="pb-4 border-b">
                <h3 className="text-xl font-semibold mb-2">Finance</h3>
                <p className="text-sm text-muted-foreground">Fees, billing, payments, and exemptions</p>
              </div>
              <div className="space-y-0 border rounded-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fee Category</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Billing Guardian</label>
                    <p className="text-base font-medium mt-1">{student.parentName}</p>
                  </div>
                  <div className="p-4 border-b md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Status</label>
                    <div className="mt-1">
                      <Badge variant={student.feesPaid === 100 ? 'default' : 'secondary'}>
                        {student.feesPaid}% Paid
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outstanding Balance</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4 md:border-r">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Discounts</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                  <div className="p-4">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Plan</label>
                    <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Portfolio */}
        <TabsContent value="portfolio">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Portfolio</h3>
                <p className="text-sm text-muted-foreground">Documents, activities, transport, and attachments</p>
              </div>

              {/* Documents & Uploads */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Documents & Uploads</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Birth Certificate</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID / Passport</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Immunization Card</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Previous School Report</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transfer Letter</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Proof of Address</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parent/Guardian ID</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medical Aid Card</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4 md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Court Order</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Passport-size Photo</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not uploaded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-semibold text-lg px-4">Transport Information</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mode of Transport</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transport Provider</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b md:border-r">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vehicle / Driver Details</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pick-up Drop-off Location</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                    <div className="md:col-span-2 p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">After-school Arrangement</label>
                      <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra-Curricular Activities */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg px-4">Extra-Curricular Activities</h4>
                <div className="space-y-0 border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1">
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clubs</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No clubs registered</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sports Teams</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No sports teams</p>
                    </div>
                    <div className="p-4 border-b">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Achievements & Awards</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No achievements recorded</p>
                    </div>
                    <div className="p-4">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Participation History</label>
                      <p className="text-base mt-1 text-muted-foreground italic">No participation history</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
