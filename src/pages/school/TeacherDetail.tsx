import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTeachers } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Mail, Phone, BookOpen, Users } from 'lucide-react';
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
import TeacherEditDialog, { TeacherFormData } from '@/components/TeacherEditDialog';
import { toast } from 'sonner';

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacher = mockTeachers.find((t) => t.id === id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!teacher) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate('/school/teachers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Teacher not found</p>
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
          <Button variant="ghost" onClick={() => navigate('/school/teachers')} className="rounded-lg">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{teacher.name}</h2>
            <p className="text-muted-foreground">{teacher.subject}</p>
          </div>
          <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
            {teacher.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-lg" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" className="rounded-lg" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="pb-4 border-b">
              <h3 className="text-xl font-semibold mb-1">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Identity and demographic details</p>
            </div>
            <div className="space-y-0 border rounded-md overflow-hidden">
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                <p className="text-base font-medium mt-1">{teacher.name}</p>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-b border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Number</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4 border-b">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nationality</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="pb-4 border-b">
              <h3 className="text-xl font-semibold mb-1">Contact Information</h3>
              <p className="text-sm text-muted-foreground">Communication and emergency details</p>
            </div>
            <div className="space-y-0 border rounded-md overflow-hidden">
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-medium">{teacher.email}</p>
                </div>
              </div>
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-medium">{teacher.phone}</p>
                </div>
              </div>
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Home Address</label>
                <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emergency Contact</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emergency Phone</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="pb-4 border-b">
              <h3 className="text-xl font-semibold mb-1">Academic Information</h3>
              <p className="text-sm text-muted-foreground">Subjects, classes, and qualifications</p>
            </div>
            <div className="space-y-0 border rounded-md overflow-hidden">
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</label>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-medium">{teacher.subject}</p>
                </div>
              </div>
              <div className="p-4 border-b">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Classes</label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {teacher.classes.map((cls) => (
                    <Badge key={cls} variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {cls}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Qualifications</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Years of Experience</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specializations</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certifications</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="pb-4 border-b">
              <h3 className="text-xl font-semibold mb-1">Employment Details</h3>
              <p className="text-sm text-muted-foreground">Contract, salary, and banking</p>
            </div>
            <div className="space-y-0 border rounded-md overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-4 border-b border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employment Type</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4 border-b">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-b border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contract End Date</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4 border-b">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Salary</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bank Name</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
                <div className="p-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Number</label>
                  <p className="text-base mt-1 text-muted-foreground italic">Not provided</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <TeacherEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        teacher={teacher}
        onSave={(_data: TeacherFormData) => {
          toast.success('Teacher information updated successfully');
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {teacher.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${teacher.name} has been deleted`);
                setDeleteDialogOpen(false);
                navigate('/school/teachers');
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
