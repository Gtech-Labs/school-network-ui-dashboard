import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Mail, Phone, Trash2, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockTeachers, Teacher } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { AddTeacherDialog } from '@/components/AddTeacherDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const ITEMS_PER_PAGE = 9;

export default function SchoolTeachers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [teacherToRemove, setTeacherToRemove] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { t } = useTranslation();

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToRemove(teacher);
    setRemoveDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teacherToRemove) {
      setTeachers(teachers.filter((t) => t.id !== teacherToRemove.id));
      toast({
        title: t('school.teachers.teacherRemoved'),
        description: t('school.teachers.teacherRemovedSuccess'),
      });
      setTeacherToRemove(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('school.teachers.title')}</h2>
          <p className="text-muted-foreground">{t('school.teachers.subtitle')}</p>
        </div>
        <Button className="shadow-md" onClick={() => setAddDialogOpen(true)}>
          <UserCircle className="mr-2 h-4 w-4" />
          {t('school.teachers.addTeacher')}
        </Button>
      </div>

      <AddTeacherDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.teachers.totalTeachers')}</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">{t('school.teachers.activeTeachingStaff')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.teachers.subjectsTaught')}</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(teachers.map((t) => t.subject)).size}</div>
            <p className="text-xs text-muted-foreground">{t('school.teachers.differentSubjects')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.teachers.classesCovered')}</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.reduce((acc, t) => acc + t.classes.length, 0)}</div>
            <p className="text-xs text-muted-foreground">{t('school.teachers.totalClassAssignments')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('school.teachers.allTeachers')}</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('school.teachers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.subject')}</TableHead>
                <TableHead>{t('common.contact')}</TableHead>
                <TableHead>{t('common.classes')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeachers.map((teacher) => (
                <TableRow key={teacher.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/school/teachers/${teacher.id}`)}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell><Badge variant="outline">{teacher.subject}</Badge></TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" /> {teacher.email}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {teacher.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls) => (
                        <Badge key={cls} variant="secondary" className="text-xs">{cls}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                      {t(`status.${teacher.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(teacher)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} teachers
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className="w-9">
                      {page}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Teacher"
        description={`Are you sure you want to remove ${teacherToRemove?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
