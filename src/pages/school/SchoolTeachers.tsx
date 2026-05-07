import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MoreVertical, Mail, Phone, BookOpen, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeachers } from '@/hooks/users/teacher.hook';
import { useSchoolId } from '@/hooks/schools/school.hook';
import { useAuth } from '@/context/AuthContext';
import AddTeacherDialog from '@/components/AddTeacherDialog';

const ITEMS_PER_PAGE = 10;

export default function SchoolTeachers() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const schoolId = useSchoolId(user?.sub);
    const { data: teacherResponse, isLoading, isError } = useTeachers(schoolId);

    const [searchQuery, setSearchQuery] = useState('');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const teachers = teacherResponse?.data || [];
    const filteredTeachers = teachers.filter((teacher: any) => {
        if (!searchQuery) return true;
        return (
            teacher.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleViewDetails = (id: string) => {
        navigate(`/school/teachers/${id}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('school.teachers.title', 'Teachers')}</h2>
                    <p className="text-muted-foreground">{t('school.teachers.subtitle', 'Manage your school\'s teaching staff')}</p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)} className="rounded-lg shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('school.teachers.addTeacher', 'Add Teacher')}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : teachers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Skeleton className="h-8 w-12" /> : teachers.filter((t: any) => t.status === 'Active').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-md">
                <CardHeader className="pb-3">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('school.teachers.searchPlaceholder', 'Search teachers...')}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-9 rounded-lg"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 py-4 border-b">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="py-12 text-center text-destructive">Failed to load teachers</div>
                    ) : filteredTeachers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">No teachers found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Subjects</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTeachers.map((teacher: any) => (
                                        <TableRow
                                            key={teacher.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleViewDetails(teacher.id)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {teacher?.fullName?.charAt(0)}
                                                    </div>
                                                    {teacher.fullName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.subjects?.length ? (
                                                        teacher.subjects.map((s: string) => (
                                                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                                                        ))
                                                    ) : '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-muted-foreground space-y-1">
                                                    {teacher.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {teacher.email}</div>}
                                                    {teacher.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {teacher.phone}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
                                                    {teacher.status || 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetails(teacher.id); }}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} teachers
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs">Page {currentPage} of {totalPages}</span>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddTeacherDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        </div>
    );
}
