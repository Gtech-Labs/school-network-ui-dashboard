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
import { useApiQuery } from '@/hooks/use-api-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, UserPlus, Users, X, ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
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
    const { data: school } = useApiQuery<any>(
        ['school', schoolId],
        `/schools/${schoolId}`,
        { enabled: !!schoolId }
    );

    const { data: subjectsResponse } = useApiQuery<any>(
        ['schoolSubjects', schoolId],
        `/schools/get-subjects?schoolId=${schoolId}&isActive=true`,
        { enabled: !!schoolId }
    );

    const availableGrades = school?.gradesOffered || [];
    const availableSubjects = Array.isArray(subjectsResponse) 
        ? subjectsResponse.map((s: any) => s.name) 
        : subjectsResponse?.data?.map((s: any) => s.name) || [];

    const { mutateAsync: createTeacher, isPending } = useCreateTeacher();

    // Single Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
    });

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

    // Bulk State
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkRows, setBulkRows] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects(prev => 
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const toggleGrade = (grade: string) => {
        setSelectedGrades(prev => 
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        );
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
                subjects: selectedSubjects,
                assignedClasses: selectedGrades,
                schoolId,
            });
            toast.success("Teacher added successfully");
            onOpenChange(false);
            setFormData({ fullName: '', email: '', phone: '' });
            setSelectedSubjects([]);
            setSelectedGrades([]);
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
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {mode === 'single' ? <UserPlus className="h-6 w-6 text-primary" /> : mode === 'bulk' ? <Users className="h-6 w-6 text-primary" /> : null}
                        {mode === 'single' ? "Individual Registration" : mode === 'bulk' ? "Bulk Teacher Import" : "Add New Teacher"}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {mode === 'single' ? "Fill in the details below to register a new teacher." : mode === 'bulk' ? "Upload your spreadsheet to register multiple teachers." : "Choose your preferred method to add teachers."}
                    </p>
                </DialogHeader>

                {mode === 'choose' && (
                    <div className="grid grid-cols-1 gap-4 py-8">
                        <button
                            className="group relative flex items-center gap-5 p-5 rounded-2xl border-2 border-muted bg-card hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
                            onClick={() => setMode('single')}
                        >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <UserPlus className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl leading-none">Register Individually</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Add a single teacher profile manually. Perfect for quick additions.</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ChevronDown className="h-4 w-4 text-primary -rotate-90" />
                                </div>
                            </div>
                        </button>

                        <button
                            className="group relative flex items-center gap-5 p-5 rounded-2xl border-2 border-muted bg-card hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
                            onClick={() => setMode('bulk')}
                        >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                <Users className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl leading-none">Bulk Data Import</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Import multiple teachers from an Excel file. Best for large schools.</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ChevronDown className="h-4 w-4 text-primary -rotate-90" />
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {mode === 'single' && (
                    <div className="space-y-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="fullName" 
                                        value={formData.fullName} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. Jane Smith" 
                                        className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">TEL</div>
                                    <Input 
                                        id="phone" 
                                        value={formData.phone} 
                                        onChange={handleInputChange} 
                                        placeholder="+27..." 
                                        className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</div>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    placeholder="teacher@school.com" 
                                    className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Grades Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Classes/Grades</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-between h-auto min-h-[42px] px-3 py-2 text-left font-normal border-muted-foreground/20 hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {selectedGrades.length > 0 ? (
                                                    selectedGrades.map(grade => (
                                                        <Badge key={grade} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0">
                                                            {grade}
                                                            <X 
                                                                className="ml-1 h-3 w-3 cursor-pointer" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleGrade(grade);
                                                                }}
                                                            />
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Select grades...</span>
                                                )}
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 shadow-xl border-primary/10" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search grades..." className="h-9" />
                                            <CommandList className="max-h-[300px]">
                                                <CommandEmpty>No grade found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableGrades.map((grade: string) => (
                                                        <CommandItem
                                                            key={grade}
                                                            onSelect={() => toggleGrade(grade)}
                                                            className="flex items-center justify-between cursor-pointer"
                                                        >
                                                            <span>{grade}</span>
                                                            {selectedGrades.includes(grade) && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Subjects Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Subjects</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-between h-auto min-h-[42px] px-3 py-2 text-left font-normal border-muted-foreground/20 hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {selectedSubjects.length > 0 ? (
                                                    selectedSubjects.map(subject => (
                                                        <Badge key={subject} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0">
                                                            {subject}
                                                            <X 
                                                                className="ml-1 h-3 w-3 cursor-pointer" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleSubject(subject);
                                                                }}
                                                            />
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Select subjects...</span>
                                                )}
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 shadow-xl border-primary/10" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search subjects..." className="h-9" />
                                            <CommandList className="max-h-[300px]">
                                                <CommandEmpty>No subject found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableSubjects.map((subject: string) => (
                                                        <CommandItem
                                                            key={subject}
                                                            onSelect={() => toggleSubject(subject)}
                                                            className="flex items-center justify-between cursor-pointer"
                                                        >
                                                            <span>{subject}</span>
                                                            {selectedSubjects.includes(subject) && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
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
                    <div className="space-y-6 py-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm">
                            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="font-semibold text-primary">Bulk Import Requirements</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Please ensure your spreadsheet includes the following columns. 
                                    Subjects and Classes must be separated by a pipe character (<code className="bg-primary/10 px-1 rounded text-primary">|</code>).
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {BULK_COLUMNS.map(col => (
                                        <Badge key={col} variant="outline" className="bg-background/50 text-[10px] uppercase font-bold tracking-tighter">{col}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant="outline" 
                                className="h-20 flex flex-col gap-2 rounded-xl border-dashed hover:bg-accent/50 group transition-all" 
                                onClick={downloadTemplate}
                            >
                                <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-xs font-medium">Download Excel Template</span>
                            </Button>

                            <label className="h-20 flex flex-col gap-2 items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group">
                                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-xs font-medium">Click to Upload Spreadsheet</span>
                                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            </label>
                        </div>

                        {bulkFile && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                        Previewing: <span className="text-primary font-normal">{bulkFile.name}</span>
                                    </h4>
                                    <Badge variant="secondary" className="font-normal">
                                        {bulkRows.length} Rows Found
                                    </Badge>
                                </div>

                                <div className="max-h-[300px] overflow-auto rounded-xl border border-muted bg-card shadow-inner">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                                            <tr className="border-b">
                                                <th className="p-3 text-left w-12">Status</th>
                                                {BULK_COLUMNS.map(col => <th key={col} className="p-3 text-left font-bold uppercase tracking-wider text-[10px] text-muted-foreground">{col}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {bulkRows.map((row, i) => (
                                                <tr key={i} className={cn("hover:bg-muted/30 transition-colors", !row._valid && "bg-destructive/5")}>
                                                    <td className="p-3">
                                                        {row._valid ? 
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                                        }
                                                    </td>
                                                    <td className="p-3 font-medium">{row.fullName}</td>
                                                    <td className="p-3 text-muted-foreground">{row.email}</td>
                                                    <td className="p-3 text-muted-foreground">{row.phone}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {row.subjects?.map((s: string) => <Badge key={s} variant="outline" className="text-[9px] px-1 h-4">{s}</Badge>)}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {row.assignedClasses?.map((c: string) => <Badge key={c} variant="outline" className="text-[9px] px-1 h-4">{c}</Badge>)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button variant="ghost" onClick={() => { setBulkFile(null); setBulkRows([]); }} className="text-destructive hover:bg-destructive/10">Discard</Button>
                                    <Button 
                                        onClick={handleSubmitBulk} 
                                        disabled={isPending || bulkRows.filter(r => r._valid).length === 0}
                                        className="min-w-[140px] shadow-lg shadow-primary/20"
                                    >
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Finalize Import
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
