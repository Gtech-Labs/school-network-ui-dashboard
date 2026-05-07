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
import { Search, Mail, Phone, MessageSquare, Users, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Parent } from '@/pages/interfaces/parent.interface';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { ParentEditDialog } from '@/components/ParentEditDialog';
import { SendEmailDialog } from '@/components/SendEmailDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast as sonnerToast } from 'sonner';
import { useParents, useDeleteParent } from '@/hooks/users/parent.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2 } from 'lucide-react';


const ITEMS_PER_PAGE = 9;

export default function SchoolParents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user: authUser } = useAuth();
  const schoolId = authUser?.tenant_id || '';
  const { data: parentsData, isLoading } = useParents(schoolId);
  const { mutateAsync: deleteParent } = useDeleteParent();

  const parents = parentsData?.data || [];

  const filteredParents = parents.filter(
    (parent: any) =>
      parent.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedParents = filteredParents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSendEmail = (parent: any) => {
    setSelectedParent(parent);
    setEmailDialogOpen(true);
  };


  const handleAddParent = () => {
    setAddDialogOpen(false);
  };


  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sonnerToast.success(`Message sent to ${selectedParent?.fullName}`);
    setMessageDialogOpen(false);
  };



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
          <Button variant="outline" className="shadow-md flex-1 sm:flex-none" onClick={() => navigate('/school/announcements')}>
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
            <div className="text-2xl font-bold">{parents.length}</div>
            <p className="text-xs text-muted-foreground">{t('school.parents.registeredParents')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.reduce((acc: number, p: any) => acc + (p.students?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total students with linked parents</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.parents.activeCommunication')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parents.filter((p: any) => p.email).length}</div>
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
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedParents.length > 0 ? (
                  paginatedParents.map((parent: any) => (
                    <TableRow
                      key={parent.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/school/parents/${parent.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{parent.fullName}</TableCell>
                      <TableCell className="whitespace-nowrap">{parent.relationship}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {parent.students?.map((student: any) => (
                            <Badge key={student.id} variant="outline" className="text-xs">
                              {student.fullName}
                            </Badge>
                          )) || <span className="text-xs text-muted-foreground italic">None linked</span>}
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
                          {parent.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/school/parents/${parent.id}`)} className="rounded-lg">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this parent profile?')) {
                                try {
                                  await deleteParent(parent.id);
                                  sonnerToast.success("Parent profile deleted");
                                } catch (error) {
                                  sonnerToast.error("Failed to delete parent");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                      No parents found.
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t px-4 sm:px-0">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredParents.length)} of {filteredParents.length} parents
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

      {/* Add Parent Dialog */}
      <ParentEditDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        parent={null}
        onSave={handleAddParent}
        mode="add"
      />

      {/* Email Dialog */}
      {selectedParent && (
        <SendEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          recipientName={selectedParent.fullName}
          recipientEmail={selectedParent.email || ''}
        />
      )}

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedParent?.fullName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="msg-subject">Subject</Label>
              <Input id="msg-subject" name="subject" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg-body">Message</Label>
              <Textarea id="msg-body" name="message" required rows={5} placeholder="Type your message..." />
            </div>
            <Button type="submit" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
