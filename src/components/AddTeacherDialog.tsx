import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTeacher } from '@/hooks/users/teacher.hook';
import { useSchoolId } from '@/hooks/schools/school.hook';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface AddTeacherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const BULK_COLUMNS = ['fullName', 'email', 'phone', 'subjects', 'assignedClasses'];

export default function AddTeacherDialog({ open, onOpenChange }: AddTeacherDialogProps) {
    const [mode, setMode] = useState<'choose' | 'single' | 'bulk'>('choose');
    const { user } = useAuth();
    const schoolId = useSchoolId(user?.sub);
    const { mutateAsync: createTeacher, isPending } = useCreateTeacher();

    // Single Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
    });

    // Bulk State
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkRows, setBulkRows] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmitSingle = async () => {
        if (!formData.fullName) {
            toast.error("Full name is required");
            return;
        }
        if (!formData.email) {
            toast.error("Email address is required");
            return;
        }
        try {
            await createTeacher({
                ...formData,
                schoolId,
            });
            toast.success("Teacher added successfully");
            onOpenChange(false);
            setFormData({ fullName: '', email: '', phone: '' });
        } catch (error) {
            toast.error("Failed to add teacher");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBulkFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            const processed = data.map((row: any) => {
                const subjects = row.subjects ? String(row.subjects).split('|').map(s => s.trim()) : [];
                const assignedClasses = row.assignedClasses ? String(row.assignedClasses).split('|').map(s => s.trim()) : [];
                return {
                    ...row,
                    subjects,
                    assignedClasses,
                    _valid: !!row.fullName && !!row.email,
                };
            });
            setBulkRows(processed);
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmitBulk = async () => {
        const validRows = bulkRows.filter(r => r._valid);
        if (validRows.length === 0) return;

        try {
            for (const row of validRows) {
                const { _valid, ...payload } = row;
                await createTeacher({ ...payload, schoolId });
            }
            toast.success(`${validRows.length} teachers imported successfully`);
            onOpenChange(false);
            setBulkFile(null);
            setBulkRows([]);
        } catch (error) {
            toast.error("Error during bulk import");
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { fullName: 'John Doe', email: 'john@example.com', phone: '123456789', subjects: 'Math|Physics', assignedClasses: '10A|11B' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teachers");
        XLSX.writeFile(wb, "teacher_import_template.xlsx");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(mode === 'bulk' && bulkRows.length > 0 ? "max-w-4xl" : "max-w-md", "max-h-[90vh] overflow-y-auto scrollbar-hide")}>
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                </DialogHeader>

                {mode === 'choose' && (
                    <div className="grid grid-cols-2 gap-4 py-8">
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
                            onClick={() => setMode('single')}
                        >
                            <UserPlus className="h-8 w-8 text-primary" />
                            <span>Add One Teacher</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 rounded-xl border-2 hover:border-primary hover:bg-primary/5"
                            onClick={() => setMode('bulk')}
                        >
                            <Users className="h-8 w-8 text-primary" />
                            <span>Bulk Import</span>
                        </Button>
                    </div>
                )}

                {mode === 'single' && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter teacher's full name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="teacher@school.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="+123456789" />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
                            <Button onClick={handleSubmitSingle} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Add Teacher
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {mode === 'bulk' && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border bg-muted/20 p-4 space-y-2 text-sm">
                            <p className="font-medium">Spreadsheet columns required:</p>
                            <div className="flex flex-wrap gap-2">
                                {BULK_COLUMNS.map(col => (
                                    <code key={col} className="bg-muted px-1.5 py-0.5 rounded border text-xs">{col}</code>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                                Subjects and Classes should be separated by a pipe character (|).
                            </p>
                        </div>

                        <Button variant="outline" className="w-full gap-2" onClick={downloadTemplate}>
                            <Download className="h-4 w-4" /> Download Template
                        </Button>

                        {!bulkFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/30 transition-all">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm">Click to upload or drag and drop</span>
                                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-64 overflow-auto border rounded-lg">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted sticky top-0">
                                            <tr>
                                                <th className="p-2 text-left w-10">Valid</th>
                                                {BULK_COLUMNS.map(col => <th key={col} className="p-2 text-left capitalize">{col}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bulkRows.map((row, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-2">
                                                        {row._valid ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                                                    </td>
                                                    <td className="p-2">{row.fullName}</td>
                                                    <td className="p-2">{row.email}</td>
                                                    <td className="p-2">{row.phone}</td>
                                                    <td className="p-2">{row.subjects?.join(', ')}</td>
                                                    <td className="p-2">{row.assignedClasses?.join(', ')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setBulkFile(null); setBulkRows([]); }}>Clear</Button>
                                    <Button onClick={handleSubmitBulk} disabled={isPending || bulkRows.filter(r => r._valid).length === 0}>
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Import {bulkRows.filter(r => r._valid).length} Teachers
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
