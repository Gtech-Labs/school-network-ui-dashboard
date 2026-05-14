import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Banknote, TrendingUp, AlertCircle, CheckCircle, FileText, Loader2, CalendarIcon, Eye, Plus, Trash2, Mail } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInvoices,
  useInvoiceTotals,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useResendInvoiceEmail
} from "@/hooks/finance.hook";
import { useToast } from '@/hooks/use-toast';
import { useApiQuery } from "@/hooks/use-api-query.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { useSchoolId } from "@/hooks/schools/school.hook.ts";

import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface FeeItem {
  id: string;
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  parentEmail?: string;
  feeItems: FeeItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid';
  notes: string;
  term: string;
  month: string;
  issueDate: string;
  dueDate: string;
  paymentMethod?: string;
  paidDate?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const paymentMethods = ['Cash', 'EFT', 'Mobile Money', 'Card', 'Cheque'];

export default function SchoolPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const schoolId = useSchoolId(user?.sub);

  const { data: studentsResponse, isLoading: studentsLoading } = useApiQuery(
      ['students', schoolId],
      `/students/profiles-per-school?schoolId=${schoolId}`,
      { enabled: !!schoolId }
  );

  const students = studentsResponse?.data || [];
  const grades = [...new Set(students.map((s: any) => s.grade || s.classSection || 'Unassigned'))].sort();

  // Finance Hooks
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ 
    schoolId: schoolId || '',
    status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase()
  });
  const { data: totalsData, isLoading: totalsLoading } = useInvoiceTotals({ schoolId: schoolId || '' });
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const deleteInvoiceMutation = useDeleteInvoice();
  const resendEmailMutation = useResendInvoiceEmail();

  const invoices = invoicesData?.data || [];

  // Generate form state
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: '1', description: 'Tuition Fee', amount: 1500 }
  ]);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Filter students by selected grade
  const studentsInGrade = students.filter((s: any) => (s.grade || s.classSection || 'Unassigned') === selectedGrade);
  const filteredInvoices = invoices.filter((invoice: any) => {
    const studentName = invoice.student?.fullName || invoice.student?.name || 'Unknown Student';
    const parentName = invoice.student?.parentProfile?.fullName || 'Parent Name';
    const invoiceNumber = invoice.id.split('-')[0].toUpperCase();

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Sorting Logic
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    // Handle nested student names
    if (sortConfig.key === 'studentName') {
      aValue = a.student?.fullName || a.student?.name || '';
      bValue = b.student?.fullName || b.student?.name || '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedInvoices.length / pageSize);
  const paginatedInvoices = sortedInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const feesPaid = totalsData?.totalPaid || 0;
  const feesOutstanding = totalsData?.totalUnpaid || 0;
  const totalFees = totalsData?.totalRevenue || 0;

  const calculateTotal = () => {
    return feeItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  };

  const addFeeItem = () => {
    setFeeItems([...feeItems, { id: Date.now().toString(), description: '', amount: 0 }]);
  };

  const removeFeeItem = (id: string) => {
    if (feeItems.length > 1) {
      setFeeItems(feeItems.filter(item => item.id !== id));
    }
  };

  const updateFeeItem = (id: string, field: 'description' | 'amount', value: string | number) => {
    setFeeItems(feeItems.map(item => 
      item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
    ));
  };

  const generateInvoiceNumber = (index: number) => {
    const year = new Date().getFullYear();
    const monthNum = (months.indexOf(selectedMonth) + 1).toString().padStart(2, '0');
    return `INV-${year}${monthNum}-${(index + 1).toString().padStart(4, '0')}`;
  };

  const handleGenerateInvoices = async () => {
    if (feeItems.some(item => !item.description || item.amount <= 0)) {
      toast({
        title: t('school.payments.invalidFeeItems'),
        description: t('school.payments.invalidFeeItemsDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (!selectedGrade) {
      toast({
        title: t('school.payments.selectGradeRequired'),
        description: t('school.payments.selectGradeRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (studentsInGrade.length === 0) {
      toast({
        title: t('school.payments.noStudentsInGrade'),
        description: t('school.payments.noStudentsInGradeDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const termMap: Record<string, number> = { term1: 1, term2: 2, term3: 3, term4: 4 };
      const term = termMap[selectedTerm] || 1;
      
      const totalAmount = calculateTotal();
      const feeBreakdown = feeItems.map(f => `${f.description}: ${formatCurrency(f.amount)}`).join('\n');
      const fullDescription = `${invoiceNotes}\n\nBreakdown:\n${feeBreakdown}`;

      const promises = studentsInGrade.map(student => 
        createInvoiceMutation.mutateAsync({
          studentProfileId: student.id,
          amount: totalAmount,
          term: term,
          dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          description: fullDescription
        })
      );

      await Promise.all(promises);

      setIsGenerating(false);
      setGenerateDialogOpen(false);
      
      // Reset form
      setFeeItems([{ id: '1', description: 'Tuition Fee', amount: 1500 }]);
      setInvoiceNotes('');

      toast({
        title: t('school.payments.invoicesGenerated'),
        description: t('school.payments.invoicesGeneratedDesc', { count: studentsInGrade.length }),
      });
    } catch (error) {
      console.error('Error generating invoices:', error);
      setIsGenerating(false);
      toast({
        title: t('common.error'),
        description: t('school.payments.generateError'),
        variant: 'destructive',
      });
    }
  };

  const openViewDialog = (invoice: any) => {
    const mappedInvoice: Invoice = {
      id: invoice.id,
      invoiceNumber: invoice.id.split('-')[0].toUpperCase(),
      studentId: invoice.studentProfileId,
      studentName: invoice.student?.fullName || invoice.student?.name || 'Unknown Student',
      className: invoice.student?.grade || invoice.student?.classSection || 'Unassigned',
      parentName: invoice.student?.parentProfile?.fullName || 'Parent Name',
      parentEmail: invoice.student?.parentProfile?.email || 'N/A',
      feeItems: [], // We'll display the description instead
      totalAmount: Number(invoice.amount),
      status: invoice.status === 'PAID' ? 'Paid' : 'Pending',
      notes: invoice.description || '',
      term: `term${invoice.term}`,
      month: months[new Date(invoice.createdAt).getMonth()],
      issueDate: format(new Date(invoice.createdAt), 'yyyy-MM-dd'),
      dueDate: invoice.dueDate,
    };
    setViewingInvoice(mappedInvoice);
    setViewDialogOpen(true);
  };

  const openMarkPaidDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentNotes('');
    setPaymentMethod('Cash');
    setMarkPaidDialogOpen(true);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;

    try {
      await updateInvoiceMutation.mutateAsync({
        id: selectedInvoice.id,
        data: { status: 'PAID' }
      });

      toast({
        title: t('school.payments.paymentMarked'),
        description: t('school.payments.paymentUpdated'),
      });

      setMarkPaidDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentNotes('');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.payments.updateError'),
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setDeleteReason('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete || !deleteReason) return;
    
    try {
      await deleteInvoiceMutation.mutateAsync({ 
        id: invoiceToDelete.id, 
        reason: deleteReason 
      });
      
      toast({
        title: t('school.payments.invoiceDeleted'),
        description: t('school.payments.invoiceDeletedDesc'),
      });
      
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      setDeleteReason('');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.payments.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleResendEmail = async (id: string) => {
    try {
      await resendEmailMutation.mutateAsync(id);
      toast({
        title: t('school.payments.emailSent'),
        description: t('school.payments.emailSentDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('school.payments.resendError'),
        variant: 'destructive',
      });
    }
  };

  const termLabels: Record<string, string> = {
    term1: t('school.payments.term1'),
    term2: t('school.payments.term2'),
    term3: t('school.payments.term3'),
    term4: t('school.payments.term4'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{t('school.payments.title')}</h2>
          <p className="text-muted-foreground">{t('school.payments.subtitle')}</p>
        </div>
        <Button 
          className="shadow-lg bg-primary hover:bg-primary/90 text-white border-none" 
          onClick={() => setGenerateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('school.payments.generateMonthlyInvoices')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.totalRevenue')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
                <p className="text-xs text-muted-foreground">{t('school.payments.thisMonth')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.collected')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(feesPaid)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter((i: any) => i.status === 'PAID').length} {t('admin.billing.payments')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.pending')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {totalsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(feesOutstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter((i: any) => i.status !== 'PAID').length} {t('admin.billing.invoices')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.totalStudents')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">{t('school.payments.enrolledStudents')}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{t('school.payments.allInvoices')}</CardTitle>
              <CardDescription>
                {t('school.payments.showingInvoices', { count: filteredInvoices.length })}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={t('school.payments.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px] bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary/20">
                <SelectValue placeholder={t('school.payments.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('school.payments.all')}</SelectItem>
                <SelectItem value="Paid">{t('school.payments.paid')}</SelectItem>
                <SelectItem value="Unpaid">{t('school.payments.unpaid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
              <div className="border rounded-md">
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t('school.payments.noInvoices')}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {t('school.payments.noInvoicesDesc')}
              </p>
              <Button className="mt-4" onClick={() => setGenerateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('school.payments.generateMonthlyInvoices')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="w-[120px] cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>
                        <div className="flex items-center gap-1">
                          {t('school.payments.invoiceNo')}
                          {sortConfig.key === 'id' && (
                            sortConfig.direction === 'asc' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <TrendingUp className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('studentName')}>
                        <div className="flex items-center gap-1">
                          {t('school.payments.student')}
                          {sortConfig.key === 'studentName' && (
                            sortConfig.direction === 'asc' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <TrendingUp className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">{t('school.payments.class')}</TableHead>
                      <TableHead className="cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('amount')}>
                        <div className="flex items-center justify-end gap-1">
                          {t('school.payments.amount')}
                          {sortConfig.key === 'amount' && (
                            sortConfig.direction === 'asc' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <TrendingUp className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('dueDate')}>
                        <div className="flex items-center gap-1">
                          {t('school.payments.dueDate')}
                          {sortConfig.key === 'dueDate' && (
                            sortConfig.direction === 'asc' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <TrendingUp className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>{t('school.payments.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.map((invoice: any) => (
                      <TableRow key={invoice.id} className="group transition-colors hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">
                          {invoice.id.split('-')[0].toUpperCase()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {invoice.student?.fullName || invoice.student?.name || 'Unknown Student'}
                        </TableCell>
                        <TableCell>
                          {invoice.student?.grade || invoice.student?.classSection || 'Unassigned'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize px-2 py-0.5 font-medium",
                              invoice.status === 'PAID' 
                                ? "bg-success/10 text-success border-success/20" 
                                : "bg-warning/10 text-warning border-warning/20"
                            )}
                          >
                            {invoice.status === 'PAID' ? t('status.paid') : t('status.unpaid')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status !== 'PAID' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMarkPaidDialog(invoice)}
                              >
                                {t('school.payments.markAsPaid')}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteDialog(invoice)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t('school.payments.pageOf', { current: currentPage, total: totalPages })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('school.payments.prev')}
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('school.payments.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate Invoices Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t('school.payments.generateMonthlyInvoices')}</DialogTitle>
            <DialogDescription>
              {t('school.payments.generateInvoicesForGrade', { count: studentsInGrade.length, grade: selectedGrade })}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/80">
              {t('school.payments.emailNotice')}
            </p>
          </div>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Grade Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('school.payments.selectGrade')}</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder={t('school.payments.selectGradePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade} ({students.filter((s: any) => (s.grade || s.classSection || 'Unassigned') === grade).length} {t('school.payments.students')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('school.payments.selectTerm')}</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term1">{t('school.payments.term1')}</SelectItem>
                      <SelectItem value="term2">{t('school.payments.term2')}</SelectItem>
                      <SelectItem value="term3">{t('school.payments.term3')}</SelectItem>
                      <SelectItem value="term4">{t('school.payments.term4')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Month and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('school.payments.month')}</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('school.payments.dueDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted/30",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : t('school.payments.selectDueDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Students Preview */}
              {studentsInGrade.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('school.payments.studentsToInvoice')}</Label>
                  <div className="bg-muted/30 rounded-lg p-3 max-h-24 overflow-y-auto border">
                    <div className="flex flex-wrap gap-2">
                      {studentsInGrade.map((student) => (
                        <Badge key={student.id} variant="secondary" className="text-[10px] py-0">
                          {student.fullName || student.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Fee Items */}
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider">{t('school.payments.feeDescription')}</Label>
                  <Button variant="ghost" size="sm" onClick={addFeeItem} className="text-primary hover:bg-primary/10">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('school.payments.addFee')}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {feeItems.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-start group animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={t('school.payments.feeDescriptionPlaceholder')}
                          value={item.description}
                          onChange={(e) => updateFeeItem(item.id, 'description', e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">R</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.amount || ''}
                            onChange={(e) => updateFeeItem(item.id, 'amount', e.target.value)}
                            className="bg-background pl-7"
                          />
                        </div>
                      </div>
                      {feeItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeeItem(item.id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 mt-2 border-t border-muted">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">{t('school.payments.totalAmount')}</p>
                    <p className="text-3xl font-black text-primary">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('school.payments.invoiceNotes')}</Label>
                <Textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder={t('school.payments.invoiceNotesPlaceholder')}
                  rows={3}
                  className="bg-muted/30 resize-none"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleGenerateInvoices} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? t('common.generating') : t('school.payments.generateInvoices')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('school.payments.viewInvoice')}</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{t('school.payments.invoiceNo')}</p>
                  <p className="font-mono font-semibold">{viewingInvoice.invoiceNumber}</p>
                </div>
                <Badge variant={viewingInvoice.status === 'Paid' || viewingInvoice.status === 'PAID' ? 'default' : 'secondary'}>
                  {t(`status.${viewingInvoice.status.toLowerCase()}`)}
                </Badge>
              </div>

              <Separator />

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('school.payments.issueDate')}</p>
                  <p className="font-medium">{viewingInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('school.payments.dueDate')}</p>
                  <p className="font-medium">{viewingInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('school.payments.term')}</p>
                  <p className="font-medium">{termLabels[viewingInvoice.term]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('school.payments.month')}</p>
                  <p className="font-medium">{viewingInvoice.month}</p>
                </div>
              </div>

              <Separator />

              {/* Student & Parent Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('school.payments.student')}:</span>
                  <span className="font-medium">{viewingInvoice.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('school.payments.class')}:</span>
                  <span className="font-medium">{viewingInvoice.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('school.payments.parent')}:</span>
                  <span className="font-medium">{viewingInvoice.parentName}</span>
                </div>
                {viewingInvoice.parentEmail && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.email')}:</span>
                    <span className="font-medium">{viewingInvoice.parentEmail}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Fee Breakdown / Description */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">{t('school.payments.details')}</p>
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                  {viewingInvoice.notes}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t('school.payments.totalAmount')}</span>
                  <span>{formatCurrency(viewingInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Info (if paid) */}
              {viewingInvoice.status === 'Paid' && (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('school.payments.paidDate')}:</span>
                      <span className="font-medium">{viewingInvoice.paidDate}</span>
                    </div>
                    {viewingInvoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('school.payments.paymentMethodLabel')}:</span>
                        <span className="font-medium">{viewingInvoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              {viewingInvoice.notes && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">{t('school.payments.notes')}:</p>
                    <p>{viewingInvoice.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {t('common.close')}
            </Button>
            {viewingInvoice?.parentEmail && viewingInvoice.parentEmail !== 'N/A' && (
              <Button 
                variant="outline" 
                onClick={() => handleResendEmail(viewingInvoice.id)}
                disabled={resendEmailMutation.isPending}
              >
                {resendEmailMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {t('school.payments.resendEmail')}
              </Button>
            )}
            {viewingInvoice?.status !== 'Paid' && viewingInvoice?.status !== 'PAID' && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                openMarkPaidDialog(viewingInvoice!);
              }}>
                {t('school.payments.markAsPaid')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('school.payments.markAsPaid')}</DialogTitle>
            <DialogDescription>
              {t('school.payments.confirmPayment', { student: selectedInvoice?.studentName })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('school.payments.invoiceNo')}:</span>
              <span className="font-mono">{selectedInvoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('school.payments.amount')}:</span>
              <span className="font-semibold">{formatCurrency(selectedInvoice?.totalAmount || 0)}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>{t('school.payments.paymentMethodLabel')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('school.payments.paymentNotes')}</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={t('school.payments.paymentNotesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleMarkAsPaid}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('school.payments.confirmPaid')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Invoice Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('school.payments.deleteInvoice')}</DialogTitle>
            <DialogDescription>
              {t('school.payments.deleteInvoiceConfirm')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason" className="text-destructive font-bold">
                {t('school.payments.reasonForDeletion')} *
              </Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={t('school.payments.reasonForDeletionPlaceholder')}
                required
                className="border-destructive/30 focus-visible:ring-destructive"
              />
              <p className="text-xs text-muted-foreground italic">
                {t('school.payments.deletionIsLogged')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteInvoice}
              disabled={!deleteReason.trim() || deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
