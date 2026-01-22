import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  ArrowLeft,
  Edit,
  Trash2,
  Ban,
  Mail,
  Phone,
  User,
  Calendar,
  KeyRound,
  Users,
  GraduationCap,
} from 'lucide-react';
import { mockParents, mockStudents, Parent } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { ParentEditDialog } from '@/components/ParentEditDialog';

export default function ParentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const parent = mockParents.find((p) => p.id === id);

  if (!parent) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Parent Not Found</h2>
        <p className="text-muted-foreground">The parent you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/school/parents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Parents
        </Button>
      </div>
    );
  }

  // Get linked students data
  const linkedStudents = parent.children.map((child) => {
    const student = mockStudents.find((s) => s.id === child.studentId);
    return {
      ...child,
      email: student?.email,
      feesPaid: student?.feesPaid,
      status: student?.status,
    };
  });

  const handleSaveEdit = (data: Partial<Parent>) => {
    toast({
      title: 'Parent Updated',
      description: `${data.fullName}'s information has been updated successfully.`,
    });
  };

  const handleSuspend = () => {
    toast({
      title: 'Parent Account Suspended',
      description: `${parent.fullName}'s account has been suspended.`,
    });
    setSuspendDialogOpen(false);
  };

  const handleDelete = () => {
    toast({
      title: 'Parent Deleted',
      description: `${parent.fullName} has been removed from the system.`,
    });
    setDeleteDialogOpen(false);
    navigate('/school/parents');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/school/parents')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold">{parent.fullName}</h2>
              <Badge variant={parent.status === 'Active' ? 'default' : 'secondary'}>
                {parent.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{parent.relationship}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)} className="flex-1 sm:flex-none">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSuspendDialogOpen(true)}
            className="flex-1 sm:flex-none text-orange-600 hover:text-orange-700"
          >
            <Ban className="mr-2 h-4 w-4" />
            Suspend
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDeleteDialogOpen(true)}
            className="flex-1 sm:flex-none text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parent Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{parent.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium">{parent.relationship}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="font-medium">{parent.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="font-medium">{parent.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Registered On
                </p>
                <p className="font-medium">{parent.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={parent.status === 'Active' ? 'default' : 'secondary'}>
                  {parent.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Account Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant={parent.hasAccountAccess ? 'default' : 'outline'}>
                  {parent.hasAccountAccess ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {parent.hasAccountAccess && (
                <div>
                  <p className="text-sm text-muted-foreground">Login Method</p>
                  <p className="font-medium capitalize">{parent.loginMethod || 'N/A'}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consent Given</p>
              <Badge variant={parent.consentGiven ? 'default' : 'destructive'}>
                {parent.consentGiven ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Linked Children ({linkedStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Student Name</TableHead>
                  <TableHead className="whitespace-nowrap">Grade</TableHead>
                  <TableHead className="whitespace-nowrap">Class</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedStudents.map((child) => (
                  <TableRow key={child.studentId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        {child.studentName}
                      </div>
                    </TableCell>
                    <TableCell>{child.grade}</TableCell>
                    <TableCell>{child.class}</TableCell>
                    <TableCell>
                      <Badge variant={child.status === 'Active' ? 'default' : 'secondary'}>
                        {child.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/school/students/${child.studentId}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ParentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        parent={parent}
        onSave={handleSaveEdit}
        mode="edit"
      />

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Parent Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {parent.fullName}'s account? 
              They will no longer be able to access the parent portal until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-orange-600 hover:bg-orange-700">
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {parent.fullName}? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
