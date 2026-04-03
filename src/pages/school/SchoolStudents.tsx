import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStudents } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MoreVertical, Plus, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AddStudentDialog } from '@/components/AddStudentDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import StudentEditDialog, { StudentFormData } from '@/components/StudentEditDialog';

const ITEMS_PER_PAGE = 9;

export default function SchoolStudents() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleConfirmRemove = () => {
    if (studentToRemove) {
      setStudents(students.filter((s) => s.id !== studentToRemove.id));
      toast.success(`${studentToRemove.name} has been removed`);
      setStudentToRemove(null);
    }
  };

  const handleEditClick = (student: any) => {
    setStudentToEdit(student);
    setEditDialogOpen(true);
  };

  const handleEditSave = (_data: StudentFormData) => {
    toast.success('Student information updated successfully');
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

      <AddStudentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('school.students.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/40 last:border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleViewDetails(student.id)}
                  >
                    <td className="py-4 pl-3">
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-foreground">{student.class}</td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">{student.parentName}</p>
                        <p className="text-sm text-muted-foreground">{student.parentEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{student.parentPhone}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary/50">
                          <div className="h-full bg-primary transition-all" style={{ width: `${student.feesPaid}%` }} />
                        </div>
                        <span className="text-sm text-foreground">{student.feesPaid}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
                        {t(`status.${student.status.toLowerCase()}`)}
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
                          <DropdownMenuItem onClick={() => handleEditClick(student)}>
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendMessage(student)}>
                            {t('common.sendMessage')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveClick(student)} className="text-destructive">
                            {t('common.remove')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
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

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t('school.students.sendMessageTo')} {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendMessageSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="text-sm font-medium">{t('common.subject')}</label>
              <Input id="subject" name="subject" required className="rounded-lg" />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-medium">{t('common.message')}</label>
              <textarea id="message" name="message" className="w-full min-h-[120px] px-3 py-2 border rounded-lg border-input bg-background" required />
            </div>
            <Button type="submit" className="w-full rounded-lg">
              <Mail className="mr-2 h-4 w-4" />
              {t('common.sendMessage')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Student"
        description={`Are you sure you want to remove ${studentToRemove?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmRemove}
        confirmLabel="Remove"
        destructive
      />

      {studentToEdit && (
        <StudentEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          student={studentToEdit}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
