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
import { Search, Mail, Phone, MessageSquare, Users, Plus, Eye } from 'lucide-react';
import { mockParents, Parent } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ParentEditDialog } from '@/components/ParentEditDialog';

export default function SchoolParents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredParents = mockParents.filter(
    (parent) =>
      parent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.children.some((child) =>
        child.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSendMessage = (parent: Parent) => {
    toast({
      title: t('school.parents.messageSent'),
      description: `${t('common.message')} ${parent.fullName}`,
    });
  };

  const handleSendEmail = (parent: Parent) => {
    toast({
      title: t('school.parents.emailSent'),
      description: `${t('common.email')} ${parent.email}`,
    });
  };

  const handleAddParent = (data: Partial<Parent>) => {
    toast({
      title: 'Parent Added',
      description: `${data.fullName} has been added successfully.`,
    });
  };

  const totalStudentsCovered = mockParents.reduce(
    (acc, parent) => acc + parent.children.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{t('school.parents.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('school.parents.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={() => setAddDialogOpen(true)} className="shadow-md flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Add Parent
          </Button>
          <Button variant="outline" className="shadow-md flex-1 sm:flex-none">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('school.parents.sendBroadcast')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.parents.totalParents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockParents.length}</div>
            <p className="text-xs text-muted-foreground">{t('school.parents.registeredParents')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.parents.studentsCovered')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentsCovered}</div>
            <p className="text-xs text-muted-foreground">{t('school.parents.totalStudentsWithParents')}</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.parents.activeCommunication')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockParents.filter((p) => p.email).length}
            </div>
            <p className="text-xs text-muted-foreground">{t('school.parents.parentsWithEmail')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{t('school.parents.allParents')}</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('school.parents.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t('school.parents.parentName')}</TableHead>
                  <TableHead className="whitespace-nowrap">Relationship</TableHead>
                  <TableHead className="whitespace-nowrap">{t('school.parents.children')}</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[200px]">{t('school.parents.contactInformation')}</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow 
                    key={parent.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/school/parents/${parent.id}`)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">{parent.fullName}</TableCell>
                    <TableCell className="whitespace-nowrap">{parent.relationship}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {parent.children.map((child) => (
                          <Badge key={child.studentId} variant="outline" className="text-xs">
                            {child.studentName}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm min-w-[180px]">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{parent.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="whitespace-nowrap">{parent.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={parent.status === 'Active' ? 'default' : 'secondary'}>
                        {parent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/school/parents/${parent.id}`)}
                          className="rounded-lg"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(parent)}
                          className="rounded-lg"
                          disabled={!parent.email}
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">{t('common.email')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(parent)}
                          className="rounded-lg"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">{t('common.message')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Parent Dialog */}
      <ParentEditDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        parent={null}
        onSave={handleAddParent}
        mode="add"
      />
    </div>
  );
}
