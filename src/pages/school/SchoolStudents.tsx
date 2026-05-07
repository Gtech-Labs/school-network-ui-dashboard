import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useApiQuery } from "@/hooks/use-api-query.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { AddStudentDialog } from '@/components/AddStudentDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import StudentEditDialog from '@/components/StudentEditDialog';
import {toast} from "sonner";
import {useUserWithProfile} from "@/hooks/users/user.hook.ts";
import {useSchoolId} from "@/hooks/schools/school.hook.ts";
import { Skeleton } from "@/components/ui/skeleton";


const ITEMS_PER_PAGE = 9;

export default function SchoolStudents() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const schoolId = useSchoolId(user?.sub);

  // 1. Data Fetching
  const { data: studentsResponse, isLoading, isError } = useApiQuery(
      ['students', schoolId],
      `/students/profiles-per-school?schoolId=${schoolId}`,
      { enabled: !!schoolId }
  );

  const students = studentsResponse?.data || [];
  console.log("students --->", students)

  // 2. UI State

  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);

  // 3. Logic
  const filteredStudents = students.filter((s: any) =>
      (s?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.middleNames || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.grade || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetails = (studentId: string) => {
    navigate(`/school/students/${studentId}`);
  };

  const handleSendMessage = (student: any) => {
    setSelectedStudent(student);
    setMessageDialogOpen(true);
  };

  const handleSendMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(`${t('school.students.messageSent')} ${selectedStudent?.name}`);
    setMessageDialogOpen(false);
  };

  const handleRemoveClick = (student: any) => {
    setStudentToRemove(student);
    setRemoveDialogOpen(true);
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('school.students.title')}</h2>
            <p className="text-muted-foreground">{t('school.students.subtitle')}</p>
          </div>
          <Button className="rounded-lg" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('school.students.addStudent')}
          </Button>
        </div>

        {/* The AddStudentDialog should now handle the multistep form and internal mutations */}
        <AddStudentDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            schoolId={schoolId}
        />

        <Card className="shadow-md">
          <CardHeader>
            <Input
                placeholder={t('school.students.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="rounded-lg max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b border-border/60">
                      <th className="pb-3 pl-3 text-left"><Skeleton className="h-4 w-24" /></th>
                      <th className="pb-3 text-left"><Skeleton className="h-4 w-16" /></th>
                      <th className="pb-3 text-left"><Skeleton className="h-4 w-24" /></th>
                      <th className="pb-3 text-left"><Skeleton className="h-4 w-24" /></th>
                      <th className="pb-3 text-left"><Skeleton className="h-4 w-16" /></th>
                      <th className="pb-3 text-left"><Skeleton className="h-4 w-16" /></th>
                      <th className="pb-3 text-right pr-3"><Skeleton className="h-4 w-12 ml-auto" /></th>
                    </tr>
                    </thead>
                    <tbody>
                    {[...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-4 pl-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-4"><Skeleton className="h-4 w-12" /></td>
                          <td className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                          <td className="py-4 text-right pr-3"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            ) : isError ? (
                <div className="text-center py-10 text-destructive">{t('common.error')}</div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b border-border/60">
                      <th className="pb-3 pl-3 text-left text-sm font-semibold text-foreground">{t('common.name')}</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.class')}</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.parent')}</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.contact')}</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.feesPaid')}</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('common.status')}</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground pr-3">{t('common.actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedStudents?.map((student: any) => (
                        <tr key={student.id} className="border-b hover:bg-accent/50 cursor-pointer" onClick={() => handleViewDetails(student.id)}>
                          <td className="py-4 pl-3 font-medium">
                              <div>
                                <p className="font-medium text-foreground">{student?.fullName || student?.middleNames || student?.preferredName}</p>
                                <p className="text-sm text-muted-foreground">{student?.email}</p>
                              </div>
                          </td>
                            <td className="py-4 text-foreground">{student?.grade}</td>
                            <td className="py-4">
                              <div>
                                <p className="font-medium text-foreground">{student.parentName}</p>
                                <p className="text-sm text-muted-foreground">{student.parentEmail}</p>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">{student?.phone}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary/50">
                                  <div className="h-full bg-primary transition-all" style={{ width: `${student?.feesPaid}%` }} />
                                </div>
                                <span className="text-sm text-foreground">{student?.feesPaid || 92}%</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge variant={student?.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
                                {student?.status || 'Active'}
                              </Badge>
                            </td>
                              <td className="py-4 text-right pr-3" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-lg">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-lg">
                                    <DropdownMenuItem onClick={() => handleViewDetails(student.id)}>
                                      {t('common.viewDetails')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {selectedStudent && (
            <StudentEditDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                student={selectedStudent}
            />
        )}
      </div>
  );
}

