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

const statusColors: Record<string, string> = {
  'Submitted': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Waiting List A': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Waiting List B': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'Provisionally Accepted': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Accepted': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Parent Accepted Offer': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Registered': 'bg-primary/10 text-primary border-primary/20',
};

const statusOptions: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Waiting List A',
  'Waiting List B',
  'Provisionally Accepted',
  'Accepted',
  'Parent Accepted Offer',
  'Registered',
];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const application = mockApplications.find((a) => a.id === id);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [statusMessage, setStatusMessage] = useState('');

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

    // Here you would typically make an API call to update the status
    toast.success(`Application status updated to: ${newStatus}`);
    setIsStatusDialogOpen(false);
    setNewStatus('');
    setStatusMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/school/applications')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{application.studentName}</h2>
          <p className="text-muted-foreground">Application ID: {application.id}</p>
        </div>
        <Badge variant="outline" className={`${statusColors[application.status]} text-sm px-3 py-1`}>
          {application.status}
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
                  <p className="text-base font-medium">{application.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grade Applying For</p>
                  <p className="text-base font-medium">{application.grade}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{new Date(application.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{new Date(application.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {application.previousSchool && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Previous School</p>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.previousSchool}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{application.address}</p>
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
                  <p className="text-base font-medium">{application.parentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.email}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{application.phone}</p>
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
              {application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
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
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.url} download>
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
                      <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ApplicationStatus)}>
                        <SelectTrigger id="new-status">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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

                    <Button onClick={handleStatusUpdate} className="w-full">
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
                {application.statusHistory
                  .slice()
                  .reverse()
                  .map((history, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`${statusColors[history.status]} text-xs`}>
                          {history.status}
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
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
