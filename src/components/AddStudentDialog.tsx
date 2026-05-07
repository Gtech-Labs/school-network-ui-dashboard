import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateStudent } from '@/hooks/users/student.hook';
import { createStudentProfile, lookupParentByIdNumber } from '@/api/students.api';
import type { CreateStudentProfileDto } from '@/api/students.api';
import * as XLSX from 'xlsx';

type Mode = 'choose' | 'single' | 'bulk';

interface AddStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schoolId?: string;
}

interface BulkRow {
    idNumber: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    grade?: string;
    parentIdNumber?: string; // national ID of parent — will be resolved to UUID before submit
    email?: string;
    phone?: string;
    _valid?: boolean;
    _error?: string;
}

// Columns shown in template / instructions
const BULK_COLUMNS = ['idNumber', 'fullName', 'dateOfBirth', 'gender', 'grade', 'parentIdNumber', 'email', 'phone'];

const INITIAL_FORM = {
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    grade: '',
    parentIdNumber: '', // national ID — resolved to UUID before API call
    email: '',
    phone: '',
    nationality: '',
};

function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
        BULK_COLUMNS,
        ['1234567890123', 'Jane Doe', '2012-04-18', 'Female', 'Grade 7', '9876543210987', 'jane@example.com', '0821234567'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_template.xlsx');
}

export function AddStudentDialog({ open, onOpenChange, schoolId }: AddStudentDialogProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<Mode>('choose');
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    // Parent lookup feedback (single form)
    const [parentLookupState, setParentLookupState] = useState<'idle' | 'checking' | 'found' | 'not-found'>('idle');
    const [resolvedParentId, setResolvedParentId] = useState<string | null>(null);

    // Bulk state
    const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
    const [bulkFileName, setBulkFileName] = useState<string | null>(null);
    const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

    const createStudent = useCreateStudent();

    const handleClose = useCallback(() => {
        setMode('choose');
        setForm(INITIAL_FORM);
        setBulkRows([]);
        setBulkFileName(null);
        setBulkProgress(null);
        setParentLookupState('idle');
        setResolvedParentId(null);
        setSubmitting(false);
        onOpenChange(false);
    }, [onOpenChange]);

    const setField = (key: keyof typeof INITIAL_FORM) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((p) => ({ ...p, [key]: e.target.value }));

    const setSelect = (key: keyof typeof INITIAL_FORM) => (value: string) =>
        setForm((p) => ({ ...p, [key]: value }));

    // ── Live parent lookup (single form) ─────────────────────────────────────
    const handleParentIdNumberBlur = async () => {
        const val = form.parentIdNumber.trim();
        if (!val) {
            setParentLookupState('idle');
            setResolvedParentId(null);
            return;
        }
        setParentLookupState('checking');
        const uuid = await lookupParentByIdNumber(val);
        if (uuid) {
            setResolvedParentId(uuid);
            setParentLookupState('found');
        } else {
            setResolvedParentId(null);
            setParentLookupState('not-found');
        }
    };

    // ── Single submit ─────────────────────────────────────────────────────────
    const handleSubmitSingle = async () => {
        if (!schoolId) { toast.error('No school assigned.'); return; }
        if (!form.idNumber || !form.fullName) { toast.error('ID Number and Full Name are required.'); return; }

        setSubmitting(true);
        try {
            // Resolve parent UUID if a parent ID number was provided but lookup wasn't done
            let parentProfileId: string | undefined = resolvedParentId ?? undefined;
            if (form.parentIdNumber.trim() && !parentProfileId) {
                const uuid = await lookupParentByIdNumber(form.parentIdNumber.trim());
                if (!uuid) {
                    toast.warning('Parent ID number not found in the system. Student will be added without a parent link.');
                } else {
                    parentProfileId = uuid;
                }
            }

            const payload: CreateStudentProfileDto = {
                schoolId: schoolId!,
                idNumber: form.idNumber,
                fullName: form.fullName,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender || undefined,
                grade: form.grade || undefined,
                email: form.email || undefined,
                phone: form.phone || undefined,
                nationality: form.nationality || undefined,
                parentProfileId,
            };

            createStudent.mutate(payload, {
                onSuccess: () => {
                    toast.success(`Student "${form.fullName}" added successfully!`);
                    handleClose();
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || 'Failed to create student.';
                    toast.error(msg);
                    setSubmitting(false);
                },
            });
        } catch {
            toast.error('An unexpected error occurred.');
            setSubmitting(false);
        }
    };

    // ── Bulk: parse spreadsheet ───────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Please upload .xlsx, .xls, or .csv');
            return;
        }
        setBulkFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target!.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

                const rows: BulkRow[] = raw.map((row) => {
                    const r: BulkRow = {
                        idNumber: String(row['idNumber'] || row['ID Number'] || '').trim(),
                        fullName: String(row['fullName'] || row['Full Name'] || '').trim(),
                        dateOfBirth: String(row['dateOfBirth'] || row['Date of Birth'] || '').trim() || undefined,
                        gender: String(row['gender'] || row['Gender'] || '').trim() || undefined,
                        grade: String(row['grade'] || row['Grade'] || '').trim() || undefined,
                        // parentIdNumber = parent's national ID (will be resolved to UUID before POST)
                        parentIdNumber: String(row['parentIdNumber'] || row['Parent ID Number'] || row['parentID'] || '').trim() || undefined,
                        email: String(row['email'] || row['Email'] || '').trim() || undefined,
                        phone: String(row['phone'] || row['Phone'] || '').trim() || undefined,
                    };
                    if (!r.idNumber) { r._valid = false; r._error = 'Missing idNumber'; }
                    else if (!r.fullName) { r._valid = false; r._error = 'Missing fullName'; }
                    else { r._valid = true; }
                    return r;
                });

                setBulkRows(rows);
            } catch {
                toast.error('Failed to parse spreadsheet. Check the format.');
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    // ── Bulk submit ───────────────────────────────────────────────────────────
    const handleSubmitBulk = async () => {
        if (!schoolId) { toast.error('No school assigned.'); return; }
        const validRows = bulkRows.filter((r) => r._valid);
        if (validRows.length === 0) { toast.error('No valid rows to import.'); return; }

        setBulkProgress({ done: 0, total: validRows.length });
        let done = 0; let failed = 0;

        for (const row of validRows) {
            try {
                // Resolve parentIdNumber → parentProfileId UUID
                let parentProfileId: string | undefined;
                if (row.parentIdNumber) {
                    const uuid = await lookupParentByIdNumber(row.parentIdNumber);
                    parentProfileId = uuid ?? undefined;
                }

                const payload: CreateStudentProfileDto = {
                    schoolId: schoolId!,
                    idNumber: row.idNumber,
                    fullName: row.fullName,
                    dateOfBirth: row.dateOfBirth,
                    gender: row.gender,
                    grade: row.grade,
                    email: row.email,
                    phone: row.phone,
                    parentProfileId,
                };
                await createStudentProfile(payload);
                done++;
            } catch {
                failed++;
            }
            setBulkProgress({ done: done + failed, total: validRows.length });
        }

        if (failed === 0) toast.success(`All ${done} students imported!`);
        else toast.warning(`${done} imported, ${failed} failed.`);
        handleClose();
    };

    const validRows = bulkRows.filter((r) => r._valid);
    const invalidRows = bulkRows.filter((r) => !r._valid);
    const isPending = submitting || createStudent.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[615px] max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'choose' && <><UserPlus className="h-5 w-5 text-primary" />{t('quickActions.addStudent', 'Add Student')}</>}
                        {mode === 'single' && <><UserPlus className="h-5 w-5 text-primary" />Add Single Student</>}
                        {mode === 'bulk'  && <><FileSpreadsheet className="h-5 w-5 text-primary" />Import Students from Spreadsheet</>}
                    </DialogTitle>
                </DialogHeader>

                {/* ── CHOOSE ── */}
                {mode === 'choose' && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {[
                            { label: 'Single Student', desc: 'Add one student manually', icon: UserPlus, next: 'single' as Mode },
                            { label: 'Bulk Import',    desc: 'Upload a spreadsheet',     icon: FileSpreadsheet, next: 'bulk' as Mode },
                        ].map(({ label, desc, icon: Icon, next }) => (
                            <button key={next} onClick={() => setMode(next)}
                                className="flex flex-col items-center gap-3 rounded-xl border border-border/60 p-6 hover:bg-accent/50 hover:border-primary/50 transition-all group">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">{label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── SINGLE ── */}
                {mode === 'single' && (
                    <div className="space-y-4 py-2">
                        {/* Required */}
                        <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-muted/20">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required</p>
                            <div className="space-y-1.5">
                                <Label htmlFor="idNumber">ID Number <span className="text-destructive">*</span></Label>
                                <Input id="idNumber" placeholder="e.g. 1234567890123" value={form.idNumber} onChange={setField('idNumber')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                <Input id="fullName" placeholder="e.g. Jane Mary Doe" value={form.fullName} onChange={setField('fullName')} />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-muted/20">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student Details</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                    <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={setField('dateOfBirth')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={form.gender} onValueChange={setSelect('gender')}>
                                        <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="grade">Grade</Label>
                                    <Input id="grade" placeholder="e.g. Grade 7" value={form.grade} onChange={setField('grade')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input id="nationality" placeholder="e.g. South African" value={form.nationality} onChange={setField('nationality')} />
                                </div>
                            </div>
                        </div>

                        {/* Contact & Parent */}
                        <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-muted/20">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact & Parent</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="student@example.com" value={form.email} onChange={setField('email')} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" placeholder="0821234567" value={form.phone} onChange={setField('phone')} />
                                </div>
                            </div>

                            {/* Parent ID Number with live lookup */}
                            <div className="space-y-1.5">
                                <Label htmlFor="parentIdNumber">Parent ID Number</Label>
                                <div className="relative">
                                    <Input
                                        id="parentIdNumber"
                                        placeholder="Parent's national ID number"
                                        value={form.parentIdNumber}
                                        onChange={(e) => {
                                            setField('parentIdNumber')(e);
                                            setParentLookupState('idle');
                                            setResolvedParentId(null);
                                        }}
                                        onBlur={handleParentIdNumberBlur}
                                        className={
                                            parentLookupState === 'found' ? 'border-green-500 pr-9' :
                                            parentLookupState === 'not-found' ? 'border-destructive pr-9' : 'pr-9'
                                        }
                                    />
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        {parentLookupState === 'checking'   && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                        {parentLookupState === 'found'      && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        {parentLookupState === 'not-found'  && <AlertCircle className="h-4 w-4 text-destructive" />}
                                        {parentLookupState === 'idle' && form.parentIdNumber && <Search className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                </div>
                                {parentLookupState === 'found' && (
                                    <p className="text-xs text-green-600 dark:text-green-400">✓ Parent profile found and will be linked.</p>
                                )}
                                {parentLookupState === 'not-found' && (
                                    <p className="text-xs text-destructive">No parent profile found with this ID. Student will be added without a parent link.</p>
                                )}
                                {parentLookupState === 'idle' && (
                                    <p className="text-xs text-muted-foreground">Enter the parent's national ID number. Leave blank if unknown.</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
                            <Button onClick={handleSubmitSingle} disabled={isPending} className="min-w-[120px]">
                                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</> : 'Add Student'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* ── BULK ── */}
                {mode === 'bulk' && (
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
                            <p className="text-sm font-medium">Spreadsheet columns:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {BULK_COLUMNS.map((col) => (
                                    <span key={col} className={`rounded-md px-2 py-0.5 text-xs font-mono ${['idNumber','fullName'].includes(col) ? 'bg-primary/20 text-primary font-bold' : 'bg-muted text-muted-foreground'}`}>
                                        {col}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <strong>idNumber</strong> and <strong>fullName</strong> are required.
                                {' '}<strong>parentIdNumber</strong> is the parent's national ID — it will be looked up automatically to link the student to the parent profile.
                            </p>
                        </div>

                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={downloadTemplate}>
                            <Download className="h-4 w-4" />Download Template (.xlsx)
                        </Button>

                        {!bulkFileName ? (
                            <label htmlFor="bulk-file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent/30 hover:border-primary/50 transition-all">
                                <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                <span className="text-xs text-muted-foreground">.xlsx, .xls, .csv</span>
                                <input ref={fileInputRef} id="bulk-file-upload" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">{bulkFileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {validRows.length} valid rows
                                            {invalidRows.length > 0 && <span className="text-destructive ml-1">· {invalidRows.length} invalid</span>}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setBulkRows([]); setBulkFileName(null); }} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {bulkRows.length > 0 && (
                            <div className="rounded-lg border border-border overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Status</th>
                                                <th className="px-3 py-2 text-left">ID Number</th>
                                                <th className="px-3 py-2 text-left">Full Name</th>
                                                <th className="px-3 py-2 text-left">Grade</th>
                                                <th className="px-3 py-2 text-left">Parent ID No.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {bulkRows.map((row, i) => (
                                                <tr key={i} className={row._valid ? '' : 'bg-destructive/5'}>
                                                    <td className="px-3 py-2">
                                                        {row._valid
                                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                            : <AlertCircle className="h-3.5 w-3.5 text-destructive" title={row._error} />}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">{row.idNumber || '—'}</td>
                                                    <td className="px-3 py-2">{row.fullName || '—'}</td>
                                                    <td className="px-3 py-2">{row.grade || '—'}</td>
                                                    <td className="px-3 py-2 font-mono text-muted-foreground">{row.parentIdNumber || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {bulkProgress && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Importing & linking parents…</span>
                                    <span>{bulkProgress.done} / {bulkProgress.total}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }} />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button variant="outline" onClick={() => setMode('choose')}>Back</Button>
                            <Button onClick={handleSubmitBulk} disabled={validRows.length === 0 || !!bulkProgress} className="min-w-[140px]">
                                {bulkProgress
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing…</>
                                    : `Import ${validRows.length} Student${validRows.length !== 1 ? 's' : ''}`}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
