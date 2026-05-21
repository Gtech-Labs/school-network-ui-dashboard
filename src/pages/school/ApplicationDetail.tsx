import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, School, FileText, Download } from 'lucide-react';
import { mockApplications, ApplicationStatus } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DocumentViewerDialog } from '@/components/DocumentViewerDialog';
import { useApplicationDetail, useUpdateApplication } from '@/hooks/users/application.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  'DRAFT': 'bg-muted text-muted-foreground border-muted-foreground/20',
  'SUBMITTED': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'UNDER-REVIEW': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'WAITLISTED': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'ACCEPTED': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'PENDING-ENROLLMENT': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'ENROLLED': 'bg-green-500/10 text-green-500 border-green-500/20',
  'REJECTED': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  'DRAFT': 'Draft',
  'SUBMITTED': 'Submitted',
  'UNDER-REVIEW': 'Under Review',
  'WAITLISTED': 'Waitlisted',
  'ACCEPTED': 'Accepted',
  'PENDING-ENROLLMENT': 'Pending Enrollment',
  'ENROLLED': 'Enrolled',
  'REJECTED': 'Rejected',
};

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER-REVIEW', label: 'Under Review' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PENDING-ENROLLMENT', label: 'Pending Enrollment' },
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function ApplicationDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApplicationDetail(id);
  const application = data as any;
  const { mutate: updateStatus, isPending } = useUpdateApplication(id);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>('');
  const [invoiceNote, setInvoiceNote] = useState<string>('');
  const [invoiceTerm, setInvoiceTerm] = useState<string>('1');
  const [viewingDoc, setViewingDoc] = useState<{ name: string; type: string; uploadedDate: string; url: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="h-48 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
            <Card><CardContent className="h-48 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="space-y-6">
            <Card><CardContent className="h-32 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Application not found</p>
        <Button onClick={() => navigate('/school/applications')}>Back to Applications</Button>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    const payload: any = {
      status: newStatus,
      statusMessage: statusMessage || undefined,
    };

    if (newStatus === 'PENDING-ENROLLMENT') {
      if (!invoiceAmount || isNaN(Number(invoiceAmount)) || Number(invoiceAmount) <= 0) {
        toast.error('Please enter a valid invoice amount');
        return;
      }
      if (!invoiceDueDate) {
        toast.error('Please enter an invoice due date');
        return;
      }
      payload.invoiceAmount = Number(invoiceAmount);
      payload.invoiceDueDate = invoiceDueDate;
      payload.invoiceNote = invoiceNote || undefined;
      payload.invoiceTerm = Number(invoiceTerm) || 1;
    }

    updateStatus(
      payload,
      {
        onSuccess: () => {
          toast.success(`Application status updated to: ${statusLabels[newStatus] || newStatus}`);
          setIsStatusDialogOpen(false);
          setNewStatus('');
          setStatusMessage('');
          setInvoiceAmount('');
          setInvoiceDueDate('');
          setInvoiceNote('');
          setInvoiceTerm('1');
        },
        onError: () => {
          toast.error('Failed to update status');
        }
      }
    );
  };

  // Map backend documents to frontend array
  const documents = [
    { name: 'Birth Certificate', url: application.birthCertificateUrl, type: 'PDF/Image' },
    { name: 'Parent ID', url: application.parentIdUrl, type: 'PDF/Image' },
    { name: 'Proof of Address', url: application.proofOfAddressUrl, type: 'PDF/Image' },
    { name: 'Latest Report', url: application.latestReportUrl, type: 'PDF' },
    { name: 'Immunisation Card', url: application.immunisationCardUrl, type: 'PDF/Image' },
  ].filter(doc => !!doc.url).map(doc => ({
    ...doc,
    uploadedDate: application.submittedAt || new Date().toISOString(),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/school/applications')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{application.student?.fullName}</h2>
          <p className="text-muted-foreground">Application ID: {application.id}</p>
        </div>
        <Badge variant="outline" className={`${statusColors[application.status]} text-sm px-3 py-1`}>
          {statusLabels[application.status] || application.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base font-medium">{application.student?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grade Applying For</p>
                  <p className="text-base font-medium">{application.student?.grade}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">
                      {application.student?.dateOfBirth ? new Date(application.student.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">
                      {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

                {application.previousSchoolName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Previous School</p>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{application.previousSchoolName}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.residentialAddress}</p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parent/Guardian Name</p>
                  <p className="text-base font-medium">{application.parent?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.parent?.email}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.parent?.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} asChild>
                        <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              )}
            </CardContent>
          </Card>

          <DocumentViewerDialog
            open={!!viewingDoc}
            onOpenChange={(open) => !open && setViewingDoc(null)}
            document={viewingDoc}
          />
        </div>

        {/* Status and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Update Status</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Application Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <div>
                        <Badge variant="outline" className={statusColors[application.status]}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-status">New Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="new-status">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status-message">Message (Optional)</Label>
                      <Textarea
                        id="status-message"
                        placeholder="Add a note about this status change..."
                        value={statusMessage}
                        onChange={(e) => setStatusMessage(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {newStatus === 'PENDING-ENROLLMENT' && (
                      <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Create Enrollment Invoice
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invoice-amount" className="text-xs">Amount (ZAR)</Label>
                            <input
                              id="invoice-amount"
                              type="number"
                              placeholder="e.g. 5000"
                              value={invoiceAmount}
                              onChange={(e) => setInvoiceAmount(e.target.value)}
                              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoice-due-date" className="text-xs">Due Date</Label>
                            <input
                              id="invoice-due-date"
                              type="date"
                              value={invoiceDueDate}
                              onChange={(e) => setInvoiceDueDate(e.target.value)}
                              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invoice-note" className="text-xs">Invoice Note / Description</Label>
                            <input
                              id="invoice-note"
                              type="text"
                              placeholder="e.g. Term 1 Registration & Enrollment Fee"
                              value={invoiceNote}
                              onChange={(e) => setInvoiceNote(e.target.value)}
                              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoice-term" className="text-xs">School Term</Label>
                            <Select value={invoiceTerm} onValueChange={setInvoiceTerm}>
                              <SelectTrigger id="invoice-term">
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Term 1</SelectItem>
                                <SelectItem value="2">Term 2</SelectItem>
                                <SelectItem value="3">Term 3</SelectItem>
                                <SelectItem value="4">Term 4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Note: This invoice will be generated and automatically sent to both Parent & Student via Email, WhatsApp, and In-App notification.
                        </p>
                      </div>
                    )}

                    <Button onClick={handleStatusUpdate} className="w-full" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Status
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  application.statusHistory
                    .slice()
                    .reverse()
                    .map((history: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`${statusColors[history.status]} text-xs`}>
                            {statusLabels[history.status] || history.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(history.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {history.message && <p className="text-sm text-muted-foreground">{history.message}</p>}
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No status history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
