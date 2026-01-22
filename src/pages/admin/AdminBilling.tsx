import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Banknote,
} from 'lucide-react';
import { mockPayments, mockSchools } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

const SUBSCRIPTION_RATES = {
  Trial: 50,
  Basic: 100,
  Premium: 150,
  Enterprise: 200,
};

export default function AdminBilling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const selectedSchool = mockSchools.find(s => s.id === selectedSchoolId);
  const invoiceAmount = selectedSchool 
    ? selectedSchool.studentsCount * SUBSCRIPTION_RATES[selectedSchool.plan]
    : 0;

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = payment.schoolName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
  const paidAmount = mockPayments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = mockPayments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);
  const overdueAmount = mockPayments
    .filter((p) => p.status === 'Overdue')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleSendReminder = (schoolName: string) => {
    toast({
      title: t('admin.billing.reminderSent'),
      description: `${t('admin.billing.paymentReminderSent')} ${schoolName}`,
    });
  };

  const handleGenerateInvoice = () => {
    if (!selectedSchool) {
      toast({
        title: 'Error',
        description: t('admin.billing.selectSchool'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('admin.billing.invoiceGenerated'),
      description: `Invoice of ${formatCurrency(invoiceAmount)} generated for ${selectedSchool.name}`,
    });
    setIsInvoiceDialogOpen(false);
    setSelectedSchoolId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('admin.billing.title')}</h2>
          <p className="text-muted-foreground">
            {t('admin.billing.subtitle')}
          </p>
        </div>
        <Button 
          className="shadow-md"
          onClick={() => setIsInvoiceDialogOpen(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          {t('admin.billing.generateInvoice')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.billing.totalRevenue')}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-success">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.billing.collected')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockPayments.filter((p) => p.status === 'Paid').length} {t('admin.billing.payments')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.billing.pending')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockPayments.filter((p) => p.status === 'Pending').length} {t('admin.billing.invoices')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.billing.overdue')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockPayments.filter((p) => p.status === 'Overdue').length} {t('admin.billing.overdue').toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.billing.schoolSubscriptions')}</CardTitle>
          <div className="mt-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('admin.billing.searchBySchool')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('admin.schools.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.schools.allStatus')}</SelectItem>
                <SelectItem value="Paid">{t('status.paid')}</SelectItem>
                <SelectItem value="Pending">{t('status.pending')}</SelectItem>
                <SelectItem value="Overdue">{t('status.overdue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.billing.school')}</TableHead>
                <TableHead>{t('admin.billing.amount')}</TableHead>
                <TableHead>{t('admin.billing.dueDate')}</TableHead>
                <TableHead>{t('admin.billing.paidDate')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.schoolName}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>
                    {payment.paidDate ? payment.paidDate : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === 'Paid'
                          ? 'default'
                          : payment.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {t(`status.${payment.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status !== 'Paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(payment.schoolName!)}
                      >
                        {t('admin.billing.sendReminder')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('admin.billing.generateInvoice')}</DialogTitle>
            <DialogDescription>
              {t('admin.billing.subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="school">{t('admin.billing.selectSchool')}</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger id="school">
                  <SelectValue placeholder={t('admin.billing.chooseSchool')} />
                </SelectTrigger>
                <SelectContent>
                  {mockSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSchool && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('admin.billing.subscriptionPlan')}</span>
                  <Badge variant="secondary">{selectedSchool.plan}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('admin.billing.numberOfPupils')}</span>
                  <span className="font-semibold">{selectedSchool.studentsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('admin.billing.ratePerPupil')}</span>
                  <span className="font-semibold">
                    {formatCurrency(SUBSCRIPTION_RATES[selectedSchool.plan])}
                  </span>
                </div>
                
                <div className="h-px bg-border" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('admin.billing.calculation')}</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedSchool.studentsCount} × {formatCurrency(SUBSCRIPTION_RATES[selectedSchool.plan])}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-semibold">{t('admin.billing.totalInvoiceAmount')}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(invoiceAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsInvoiceDialogOpen(false);
                setSelectedSchoolId('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleGenerateInvoice}
              disabled={!selectedSchool}
            >
              {t('admin.billing.generateInvoice')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
