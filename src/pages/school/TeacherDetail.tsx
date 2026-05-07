import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, Edit, Trash2, Mail, Phone, BookOpen, Users, 
    Calendar, Shield, Activity, Loader2, MoreVertical
} from 'lucide-react';
import { useTeacherDetail, useDeleteTeacher, useUpdateTeacher } from '@/hooks/users/teacher.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
import TeacherEditDialog from '@/components/TeacherEditDialog';

export default function TeacherDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: teacherResponse, isLoading, isError } = useTeacherDetail(id!);
    const { mutateAsync: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();
    const { mutateAsync: updateTeacher, isPending: isUpdating } = useUpdateTeacher(id!);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const teacher = teacherResponse?.user;

    const handleDelete = async () => {
        try {
            await deleteTeacher(id!);
            toast.success("Teacher removed successfully");
            navigate('/school/teachers');
        } catch (error) {
            toast.error("Failed to remove teacher");
        }
    };

    const handleSuspend = async () => {
        try {
            await updateTeacher({ status: teacher.status === 'Active' ? 'Suspended' : 'Active' });
            toast.success(`Teacher ${teacher.status === 'Active' ? 'suspended' : 'activated'} successfully`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 md:col-span-1" />
                    <Skeleton className="h-64 md:col-span-2" />
                </div>
            </div>
        );
    }

    if (isError || !teacher) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold">Teacher not found</h2>
                <Button variant="link" onClick={() => navigate('/school/teachers')}>Back to teachers</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/school/teachers')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Teachers
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)} className="gap-2">
                        <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleSuspend} 
                        disabled={isUpdating}
                        className={teacher.status === 'Active' ? 'text-orange-500' : 'text-green-500'}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {teacher.status === 'Active' ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1 border-border/50">
                    <CardContent className="pt-6 text-center">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mx-auto mb-4">
                            {teacher?.fullName?.charAt(0) || '?'}
                        </div>
                        <h2 className="text-2xl font-bold">{teacher?.fullName || 'Unnamed Teacher'}</h2>
                        <Badge className="mt-2" variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                            {teacher.status || 'Active'}
                        </Badge>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{teacher.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{teacher.phone || 'No phone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span>ID: {teacher.id.split('-')[0].toUpperCase()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="lg:col-span-2 border-border/50">
                    <CardHeader>
                        <CardTitle>Teacher Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="overview">
                            <TabsList className="grid grid-cols-3 mb-6">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="academic">Academic</TabsTrigger>
                                <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Full Name</p>
                                        <p className="font-medium">{teacher?.fullName || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact Number</p>
                                        <p className="font-medium">{teacher.phone || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                                        <p className="font-medium">{teacher.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Employment Status</p>
                                        <p className="font-medium">{teacher.status || 'Active'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="academic" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <BookOpen className="h-4 w-4 text-primary" /> Subjects Taught
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.subjects?.length ? teacher.subjects.map((s: string) => (
                                                <Badge key={s} variant="outline">{s}</Badge>
                                            )) : <span className="text-sm text-muted-foreground italic">No subjects assigned</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Users className="h-4 w-4 text-primary" /> Assigned Classes
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.assignedClasses?.length ? teacher.assignedClasses.map((c: string) => (
                                                <Badge key={c} variant="secondary">{c}</Badge>
                                            )) : <span className="text-sm text-muted-foreground italic">No classes assigned</span>}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="activity">
                                <div className="py-8 text-center text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>Activity logs will appear here.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the teacher profile for <strong>{teacher?.fullName || 'this teacher'}</strong> and remove their access to the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TeacherEditDialog 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
                teacher={teacher} 
            />
        </div>
    );
}
