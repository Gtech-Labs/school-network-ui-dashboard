import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'choose' | 'single' | 'bulk';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('choose');
  const [form, setForm] = useState({ idNumber: '', firstName: '', surname: '', nationality: '' });

  const handleClose = () => {
    setMode('choose');
    setForm({ idNumber: '', firstName: '', surname: '', nationality: '' });
    onOpenChange(false);
  };

  const handleSubmitSingle = () => {
    if (!form.idNumber || !form.firstName || !form.surname || !form.nationality) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Student ${form.firstName} ${form.surname} added successfully`);
    handleClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)');
      return;
    }
    toast.success(`File "${file.name}" uploaded. Students will be imported shortly.`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'choose' && t('quickActions.addStudent', 'Add Student')}
            {mode === 'single' && 'Add Single Student'}
            {mode === 'bulk' && 'Upload Student List'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => setMode('single')}
              className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 hover:bg-accent/50 transition-colors"
            >
              <UserPlus className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Single Student</span>
              <span className="text-xs text-muted-foreground text-center">Add one student manually</span>
            </button>
            <button
              onClick={() => setMode('bulk')}
              className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 hover:bg-accent/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Upload Spreadsheet</span>
              <span className="text-xs text-muted-foreground text-center">Import multiple students</span>
            </button>
          </div>
        )}

        {mode === 'single' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input id="idNumber" placeholder="e.g. STU-001" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" placeholder="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" placeholder="e.g. South African" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
              <Button onClick={handleSubmitSingle}>Add Student</Button>
            </DialogFooter>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Upload a spreadsheet (.xlsx, .xls, or .csv) with the following columns:
            </p>
            <div className="rounded-md border border-border p-3 bg-muted/30">
              <p className="text-xs font-mono font-medium">ID Number | First Name | Surname | Nationality</p>
            </div>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                <span className="text-xs text-muted-foreground">.xlsx, .xls, .csv</span>
                <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
