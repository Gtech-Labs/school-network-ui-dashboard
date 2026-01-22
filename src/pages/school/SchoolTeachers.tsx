import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Mail, Phone, Edit, Trash2, UserCircle } from 'lucide-react';
import { mockTeachers, Teacher } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function SchoolTeachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAddTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    toast({
      title: t('school.teachers.teacherAdded'),
      description: `${formData.get('name')} ${t('school.teachers.teacherAddedSuccess')}`,
    });
    setAddDialogOpen(false);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    toast({
      title: t('school.teachers.teacherRemoved'),
      description: t('school.teachers.teacherRemovedSuccess'),
    });
  };

  const handleEdit = (teacher: Teacher) => {
    toast({
      title: t('school.teachers.editTeacher'),
      description: `${teacher.name} - ${t('school.teachers.editFeatureComingSoon')}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('school.teachers.title')}</h2>
          <p className="text-muted-foreground">{t('school.teachers.subtitle')}</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              {t('school.teachers.addTeacher')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('school.teachers.addNewTeacher')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('school.teachers.teacherName')}</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div>
                <Label htmlFor="subject">{t('common.subject')}</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div>
                <Label htmlFor="classes">{t('school.teachers.classesCommaSeparated')}</Label>
                <Input id="classes" name="classes" placeholder={t('school.teachers.classesPlaceholder')} required />
              </div>
              <Button type="submit" className="w-full">{t('school.teachers.addTeacher')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <div className="text-2xl font-bold">
              {new Set(teachers.map((t) => t.subject)).size}
            </div>
            <p className="text-xs text-muted-foreground">{t('school.teachers.differentSubjects')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.teachers.classesCovered')}</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.reduce((acc, t) => acc + t.classes.length, 0)}
            </div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {teacher.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls) => (
                        <Badge key={cls} variant="secondary" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={teacher.status === 'Active' ? 'default' : 'secondary'}
                    >
                      {t(`status.${teacher.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
