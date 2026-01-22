import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { FileBarChart, Download, Search, Filter, Eye, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  school: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate: string | null;
  email: string;
  address: string;
  items: { description: string; quantity: number; unitPrice: string; total: string }[];
}

export default function AdminInvoices() {
  const { t } = useTranslation();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const invoices: Invoice[] = [
    { 
      id: 'INV-2024-001', 
      school: 'Greenwood High School', 
      amount: 'R12,500',
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-12',
      email: 'billing@greenwoodhigh.edu',
      address: '123 Oak Street, Johannesburg, 2000',
      items: [
        { description: 'Premium Plan - Annual Subscription', quantity: 1, unitPrice: 'R10,000', total: 'R10,000' },
        { description: 'Additional Storage (50GB)', quantity: 1, unitPrice: 'R2,500', total: 'R2,500' },
      ]
    },
    { 
      id: 'INV-2024-002', 
      school: 'Riverside Academy', 
      amount: 'R8,400',
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-14',
      email: 'accounts@riverside.edu',
      address: '45 River Road, Cape Town, 8001',
      items: [
        { description: 'Standard Plan - Annual Subscription', quantity: 1, unitPrice: 'R8,400', total: 'R8,400' },
      ]
    },
    { 
      id: 'INV-2024-003', 
      school: 'Oakmont International', 
      amount: 'R25,000',
      status: 'pending',
      dueDate: '2024-01-20',
      paidDate: null,
      email: 'finance@oakmont.edu',
      address: '789 Mountain View, Pretoria, 0001',
      items: [
        { description: 'Enterprise Plan - Annual Subscription', quantity: 1, unitPrice: 'R20,000', total: 'R20,000' },
        { description: 'Priority Support Add-on', quantity: 1, unitPrice: 'R5,000', total: 'R5,000' },
      ]
    },
    { 
      id: 'INV-2024-004', 
      school: 'Sunset Valley School', 
      amount: 'R3,000',
      status: 'overdue',
      dueDate: '2024-01-10',
      paidDate: null,
      email: 'admin@sunsetvalley.edu',
      address: '22 Sunset Boulevard, Durban, 4001',
      items: [
        { description: 'Basic Plan - Monthly Subscription', quantity: 3, unitPrice: 'R1,000', total: 'R3,000' },
      ]
    },
    { 
      id: 'INV-2024-005', 
      school: 'Maple Leaf Academy', 
      amount: 'R6,400',
      status: 'pending',
      dueDate: '2024-01-25',
      paidDate: null,
      email: 'billing@mapleleaf.edu',
      address: '88 Maple Street, Bloemfontein, 9300',
      items: [
        { description: 'Standard Plan - Monthly Subscription', quantity: 8, unitPrice: 'R800', total: 'R6,400' },
      ]
    },
  ];

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const generateInvoiceContent = (invoice: Invoice): string => {
    const lines = [
      '═══════════════════════════════════════════════════════════════',
      '                           INVOICE                              ',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Invoice Number: ${invoice.id}`,
      `Date Issued: ${new Date().toLocaleDateString()}`,
      `Due Date: ${invoice.dueDate}`,
      `Status: ${invoice.status.toUpperCase()}`,
      invoice.paidDate ? `Paid Date: ${invoice.paidDate}` : '',
      '',
      '───────────────────────────────────────────────────────────────',
      'BILL TO:',
      '───────────────────────────────────────────────────────────────',
      invoice.school,
      invoice.address,
      invoice.email,
      '',
      '───────────────────────────────────────────────────────────────',
      'ITEMS:',
      '───────────────────────────────────────────────────────────────',
      '',
    ];

    invoice.items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.description}`);
      lines.push(`   Quantity: ${item.quantity} x ${item.unitPrice} = ${item.total}`);
      lines.push('');
    });

    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`                                    TOTAL: ${invoice.amount}`);
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('Thank you for your business!');
    lines.push('');
    lines.push('Payment Methods:');
    lines.push('- Bank Transfer: FNB Account 62123456789, Branch Code 250655');
    lines.push('- Reference: ' + invoice.id);
    lines.push('');
    lines.push('For queries, contact: billing@schoolsystem.com');

    return lines.filter(line => line !== undefined).join('\n');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const content = generateInvoiceContent(invoice);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${invoice.id} downloaded`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.invoices')}</h1>
          <p className="text-muted-foreground">Manage subscription invoices</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <FileBarChart className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-success font-bold">✓</span>
            </div>
            <p className="text-2xl font-bold">R20,900</p>
            <p className="text-sm text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-warning font-bold">!</span>
            </div>
            <p className="text-2xl font-bold">R31,400</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-destructive font-bold">!</span>
            </div>
            <p className="text-2xl font-bold">R3,000</p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>View and manage all subscription invoices</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-9 w-64" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileBarChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono">{invoice.id}</p>
                      <Badge variant={
                        invoice.status === 'paid' ? 'default' :
                        invoice.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.school}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {invoice.dueDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button variant="ghost" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              Invoice {selectedInvoice?.id}
            </DialogTitle>
            <DialogDescription>
              Invoice details and line items
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedInvoice.school}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.email}</p>
                </div>
                <Badge variant={
                  selectedInvoice.status === 'paid' ? 'default' :
                  selectedInvoice.status === 'pending' ? 'secondary' : 'destructive'
                } className="text-sm">
                  {selectedInvoice.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{selectedInvoice.dueDate}</p>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{selectedInvoice.paidDate}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Line Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.unitPrice}
                        </p>
                      </div>
                      <p className="font-semibold">{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{selectedInvoice.amount}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
