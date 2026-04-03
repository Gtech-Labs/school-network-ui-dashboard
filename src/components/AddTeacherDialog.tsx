import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'choose' | 'single' | 'bulk';

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeacherDialog({ open, onOpenChange }: AddTeacherDialogProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [form, setForm] = useState({ name: '', subjects: '', email: '', phone: '', classes: '' });

  const handleClose = () => {
    setMode('choose');
    setForm({ name: '', subjects: '', email: '', phone: '', classes: '' });
    onOpenChange(false);
  };

  const handleSubmitSingle = () => {
    if (!form.name || !form.subjects || !form.email || !form.phone || !form.classes) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Teacher ${form.name} added successfully`);
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
    toast.success(`File "${file.name}" uploaded. Teachers will be imported shortly.`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'choose' && 'Add Teacher'}
            {mode === 'single' && 'Add Single Teacher'}
            {mode === 'bulk' && 'Upload Teacher List'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => setMode('single')}
              className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 hover:bg-accent/50 transition-colors"
            >
              <UserPlus className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Single Teacher</span>
              <span className="text-xs text-muted-foreground text-center">Add one teacher manually</span>
            </button>
            <button
              onClick={() => setMode('bulk')}
              className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 hover:bg-accent/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Upload Spreadsheet</span>
              <span className="text-xs text-muted-foreground text-center">Import multiple teachers</span>
            </button>
          </div>
        )}

        {mode === 'single' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="teacherName">Full Name</Label>
              <Input id="teacherName" placeholder="e.g. Dr. James Anderson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherSubjects">Subjects (comma separated)</Label>
              <Input id="teacherSubjects" placeholder="e.g. Mathematics, Physics" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherEmail">Contact Email</Label>
              <Input id="teacherEmail" type="email" placeholder="e.g. teacher@school.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherPhone">Phone</Label>
              <Input id="teacherPhone" placeholder="e.g. +27 XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherClasses">Classes (comma separated)</Label>
              <Input id="teacherClasses" placeholder="e.g. Grade 10-A, Grade 11-B" value={form.classes} onChange={(e) => setForm({ ...form, classes: e.target.value })} />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
              <Button onClick={handleSubmitSingle}>Add Teacher</Button>
            </DialogFooter>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Upload a spreadsheet (.xlsx, .xls, or .csv) with the following columns:
            </p>
            <div className="rounded-md border border-border p-3 bg-muted/30">
              <p className="text-xs font-mono font-medium">Name | Subjects (comma separated) | Contact Email | Phone | Classes</p>
            </div>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="teacher-file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                <span className="text-xs text-muted-foreground">.xlsx, .xls, .csv</span>
                <input id="teacher-file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
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
