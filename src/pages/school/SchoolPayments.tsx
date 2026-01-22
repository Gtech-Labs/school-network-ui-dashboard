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
import { Search, Banknote, TrendingUp, AlertCircle, CheckCircle, FileText, Loader2, CalendarIcon, Eye, Plus, Trash2 } from 'lucide-react';
import { mockStudents } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
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

// Get unique grades from students
const grades = [...new Set(mockStudents.map(s => s.class || 'Grade 10A'))].sort();

export default function SchoolPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const { toast } = useToast();
  const { t } = useTranslation();

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
  const studentsInGrade = mockStudents.filter(s => (s.class || 'Grade 10A') === selectedGrade);
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const paidAmount = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === 'Pending')
    .reduce((acc, i) => acc + i.totalAmount, 0);

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
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const existingCount = invoices.length;
    const newInvoices: Invoice[] = studentsInGrade.map((student, index) => ({
      id: `INV-${Date.now()}-${index}`,
      invoiceNumber: generateInvoiceNumber(existingCount + index),
      studentId: student.id,
      studentName: student.name,
      className: student.class || 'Grade 10A',
      parentName: student.parentName || 'Parent Name',
      feeItems: [...feeItems],
      totalAmount: calculateTotal(),
      status: 'Pending' as const,
      notes: invoiceNotes,
      term: selectedTerm,
      month: selectedMonth,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
    }));

    setInvoices(prev => [...prev, ...newInvoices]);
    setIsGenerating(false);
    setGenerateDialogOpen(false);
    
    // Reset form
    setFeeItems([{ id: '1', description: 'Tuition Fee', amount: 1500 }]);
    setInvoiceNotes('');

    toast({
      title: t('school.payments.invoicesGenerated'),
      description: t('school.payments.invoicesGeneratedDesc', { count: newInvoices.length }),
    });
  };

  const openViewDialog = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setViewDialogOpen(true);
  };

  const openMarkPaidDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentNotes('');
    setPaymentMethod('Cash');
    setMarkPaidDialogOpen(true);
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === selectedInvoice.id
          ? {
              ...inv,
              status: 'Paid' as const,
              notes: paymentNotes || inv.notes,
              paymentMethod: paymentMethod,
              paidDate: format(new Date(), 'yyyy-MM-dd'),
            }
          : inv
      )
    );

    toast({
      title: t('school.payments.paymentMarked'),
      description: t('school.payments.paymentUpdated'),
    });

    setMarkPaidDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentNotes('');
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
        <Button className="shadow-md" onClick={() => setGenerateDialogOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
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
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t('school.payments.thisMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.collected')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === 'Paid').length} {t('admin.billing.payments')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.pending')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === 'Pending').length} {t('admin.billing.invoices')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('school.payments.totalStudents')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">{t('school.payments.enrolledStudents')}</p>
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('school.payments.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.schools.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.schools.allStatus')}</SelectItem>
                <SelectItem value="Paid">{t('status.paid')}</SelectItem>
                <SelectItem value="Pending">{t('status.pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{t('school.payments.noInvoices')}</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {t('school.payments.noInvoicesDesc')}
              </p>
              <Button className="mt-4" onClick={() => setGenerateDialogOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                {t('school.payments.generateMonthlyInvoices')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('school.payments.invoiceNo')}</TableHead>
                    <TableHead>{t('school.payments.student')}</TableHead>
                    <TableHead>{t('school.payments.class')}</TableHead>
                    <TableHead>{t('school.payments.amount')}</TableHead>
                    <TableHead>{t('school.payments.dueDate')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{invoice.studentName}</TableCell>
                      <TableCell>{invoice.className}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === 'Paid' ? 'default' : 'secondary'}
                        >
                          {t(`status.${invoice.status.toLowerCase()}`)}
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
                          {invoice.status !== 'Paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMarkPaidDialog(invoice)}
                            >
                              {t('school.payments.markAsPaid')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Grade Selection */}
              <div className="space-y-2">
                <Label>{t('school.payments.selectGrade')}</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('school.payments.selectGradePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade} ({mockStudents.filter(s => (s.class || 'Grade 10A') === grade).length} {t('school.payments.students')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Preview */}
              {studentsInGrade.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('school.payments.studentsToInvoice')}</Label>
                  <div className="bg-muted/50 rounded-md p-3 max-h-24 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {studentsInGrade.map((student) => (
                        <Badge key={student.id} variant="outline" className="text-xs">
                          {student.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Term and Month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('school.payments.selectTerm')}</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>{t('school.payments.month')}</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>{t('school.payments.dueDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
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

              <Separator />

              {/* Fee Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">{t('school.payments.feeDescription')}</Label>
                  <Button variant="outline" size="sm" onClick={addFeeItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t('school.payments.addFee')}
                  </Button>
                </div>
                
                {feeItems.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={t('school.payments.feeDescriptionPlaceholder')}
                        value={item.description}
                        onChange={(e) => updateFeeItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.amount || ''}
                        onChange={(e) => updateFeeItem(item.id, 'amount', e.target.value)}
                      />
                    </div>
                    {feeItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeeItem(item.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('school.payments.totalAmount')}</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t('school.payments.invoiceNotes')}</Label>
                <Textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder={t('school.payments.invoiceNotesPlaceholder')}
                  rows={3}
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
                <Badge variant={viewingInvoice.status === 'Paid' ? 'default' : 'secondary'}>
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
              </div>

              <Separator />

              {/* Fee Breakdown */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">{t('school.payments.feeBreakdown')}</p>
                {viewingInvoice.feeItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
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
            {viewingInvoice?.status !== 'Paid' && (
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
    </div>
  );
}
