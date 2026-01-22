import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStudents } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, MoreVertical, Plus, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function SchoolStudents() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    toast.success(`${formData.get('name')} ${t('school.students.studentAdded')}`);
    setAddDialogOpen(false);
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('school.students.title')}</h2>
          <p className="text-muted-foreground">{t('school.students.subtitle')}</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              {t('school.students.addStudent')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>{t('school.students.addNewStudent')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('school.students.studentName')}</Label>
                <Input id="name" name="name" required className="rounded-lg" />
              </div>
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input id="email" name="email" type="email" required className="rounded-lg" />
              </div>
              <div>
                <Label htmlFor="class">{t('school.students.class')}</Label>
                <Input id="class" name="class" required className="rounded-lg" />
              </div>
              <div>
                <Label htmlFor="parentName">{t('school.students.parentName')}</Label>
                <Input id="parentName" name="parentName" required className="rounded-lg" />
              </div>
              <div>
                <Label htmlFor="parentEmail">{t('school.students.parentEmail')}</Label>
                <Input id="parentEmail" name="parentEmail" type="email" required className="rounded-lg" />
              </div>
              <div>
                <Label htmlFor="parentPhone">{t('school.students.parentPhone')}</Label>
                <Input id="parentPhone" name="parentPhone" required className="rounded-lg" />
              </div>
              <Button type="submit" className="w-full rounded-lg">{t('school.students.addStudent')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('school.students.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('common.name')}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.class')}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.parent')}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.contact')}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('school.students.feesPaid')}</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">{t('common.status')}</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-border/40 last:border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleViewDetails(student.id)}
                  >
                    <td className="py-4">
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
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${student.feesPaid}%` }}
                          />
                        </div>
                        <span className="text-sm text-foreground">{student.feesPaid}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="rounded-lg">
                        {t(`status.${student.status.toLowerCase()}`)}
                      </Badge>
                    </td>
                    <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem onClick={() => toast.success(t('common.edit'))}>
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendMessage(student)}>
                            {t('common.sendMessage')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success(`${student.name} ${t('common.remove').toLowerCase()}`)}
                            className="text-destructive"
                          >
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
              <Label htmlFor="subject">{t('common.subject')}</Label>
              <Input id="subject" name="subject" required className="rounded-lg" />
            </div>
            <div>
              <Label htmlFor="message">{t('common.message')}</Label>
              <textarea 
                id="message" 
                name="message" 
                className="w-full min-h-[120px] px-3 py-2 border rounded-lg border-input bg-background" 
                required 
              />
            </div>
            <Button type="submit" className="w-full rounded-lg">
              <Mail className="mr-2 h-4 w-4" />
              {t('common.sendMessage')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
