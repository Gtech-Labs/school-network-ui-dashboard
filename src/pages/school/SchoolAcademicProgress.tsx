import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2, Pencil, Trash2, Save, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { toast as sonnerToast } from 'sonner';
import * as academicApi from '@/api/academic.api';
import { useAcademicRecords, useCreateAcademicRecord, useUpdateAcademicRecord, useDeleteAcademicRecord, useBulkValidate, useBulkCreate } from '@/hooks/academic.hook';
import { useAuth } from '@/context/AuthContext';
import { useUserWithProfile } from '@/hooks/users/user.hook';
import { useSubjects } from '@/hooks/schools/subject.hook';
import * as XLSX from 'xlsx';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock student data for validation (Static for now as it's for simulation)
const mockClassStudents: Record<string, Array<{ id: string; name: string }>> = {
  'Grade 10-A': [
    { id: 'STU001', name: 'Emma Johnson' },
    { id: 'STU002', name: 'Liam Smith' },
    { id: 'STU003', name: 'Sophia Williams' },
    { id: 'STU004', name: 'Noah Brown' },
    { id: 'STU005', name: 'Olivia Davis' },
  ],
  'Grade 10-B': [
    { id: 'STU006', name: 'James Wilson' },
    { id: 'STU007', name: 'Ava Martinez' },
    { id: 'STU008', name: 'William Anderson' },
    { id: 'STU009', name: 'Isabella Thomas' },
    { id: 'STU010', name: 'Benjamin Taylor' },
  ],
  'Grade 9-A': [
    { id: 'STU011', name: 'Mia Jackson' },
    { id: 'STU012', name: 'Lucas White' },
    { id: 'STU013', name: 'Charlotte Harris' },
    { id: 'STU014', name: 'Henry Martin' },
  ],
  'Grade 9-B': [
    { id: 'STU015', name: 'Amelia Thompson' },
    { id: 'STU016', name: 'Alexander Garcia' },
    { id: 'STU017', name: 'Harper Robinson' },
  ],
  'Grade 11-A': [
    { id: 'STU018', name: 'Ethan Clark' },
    { id: 'STU019', name: 'Evelyn Rodriguez' },
    { id: 'STU020', name: 'Michael Lewis' },
    { id: 'STU021', name: 'Abigail Lee' },
    { id: 'STU022', name: 'Daniel Walker' },
    { id: 'STU023', name: 'Emily Hall' },
  ],
  'Grade 11-B': [
    { id: 'STU024', name: 'Matthew Allen' },
    { id: 'STU025', name: 'Sofia Young' },
    { id: 'STU026', name: 'David King' },
    { id: 'STU027', name: 'Victoria Wright' },
  ],
};

interface ParsedMark {
  studentId: string;
  studentName: string;
  mark: number | null;
  status: 'valid' | 'invalid' | 'missing';
  errorMessage?: string;
}

interface TermSummary {
  studentId: string;
  studentName: string;
  mark: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

interface GradeRecord {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  term: string;
  mark: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

const ITEMS_PER_PAGE = 10;

export default function SchoolAcademicProgress() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('grade-input');

  // Form state for Grade Input
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const { user } = useAuth();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserWithProfile(user?.sub || '');
  const school = userProfile?.schoolAdminProfile?.school;

  const { data: schoolSubjects, isLoading: isLoadingSubjects } = useSubjects(userProfile?.schoolAdminProfile?.school?.id || '');

  // Dynamic configuration from school profile
  const terms = school?.academicTermsCount
    ? Array.from({ length: Number(school.academicTermsCount) }, (_, i) => `Term ${i + 1}`)
    : ['Term 1', 'Term 2', 'Term 3', 'Term 4'];
  const classes = school?.gradesOffered || [];
  const subjects = schoolSubjects?.map((s: any) => s.name) || [];

  const getGradeFromMarkStatic = (mark: number): string => {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
  };

  const generateMockGrades = (): GradeRecord[] => {
    const records: GradeRecord[] = [];
    let id = 1;

    Object.entries(mockClassStudents).forEach(([className, students]) => {
      students.forEach(student => {
        subjects.forEach(subject => {
          terms.forEach(term => {
            if (Math.random() > 0.3) { // 70% chance of having a grade
              const mark = Math.floor(Math.random() * 50) + 50;
              records.push({
                id: id++,
                studentId: student.id,
                studentName: student.name,
                class: className,
                subject,
                term,
                mark,
                grade: getGradeFromMarkStatic(mark),
                status: mark >= 50 ? 'Pass' : 'Fail',
              });
            }
          });
        });
      });
    });

    return records;
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [parsedMarks, setParsedMarks] = useState<ParsedMark[]>([]);
  const [termSummary, setTermSummary] = useState<TermSummary[]>([]);
  const [validationComplete, setValidationComplete] = useState(false);

  // Overview state
  const [overviewGrades, setOverviewGrades] = useState<GradeRecord[]>(() => generateMockGrades());
  const [overviewFilterClass, setOverviewFilterClass] = useState('all');
  const [overviewFilterSubject, setOverviewFilterSubject] = useState('all');
  const [overviewFilterTerm, setOverviewFilterTerm] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMark, setEditingMark] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'update' | 'delete', id: string, data?: any } | null>(null);

  const { data: realGrades, isLoading: isLoadingGrades } = useAcademicRecords({
    grade: overviewFilterClass === 'all' ? undefined : overviewFilterClass,
    subject: overviewFilterSubject === 'all' ? undefined : overviewFilterSubject,
    term: overviewFilterTerm === 'all' ? undefined : overviewFilterTerm,
  });

  const { mutateAsync: createRecord, isPending: isCreating } = useCreateAcademicRecord();
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdateAcademicRecord(pendingAction?.id || '');
  const { mutateAsync: deleteRecord, isPending: isDeleting } = useDeleteAcademicRecord();
  const { mutateAsync: validateBulk, isPending: isValidatingBulk } = useBulkValidate();
  const { mutateAsync: createBulk, isPending: isCreatingBulk } = useBulkCreate();

  const canUpload = selectedTerm && selectedClass && selectedSubject;
  const hasValidMarks = parsedMarks.some(m => m.status === 'valid');
  const invalidCount = parsedMarks.filter(m => m.status !== 'valid').length;

  // Filter grades for overview
  const displayedGrades = (realGrades || overviewGrades).filter((grade: any) => {
    if (overviewFilterClass !== 'all' && (grade.class || grade.grade) !== overviewFilterClass) return false;
    if (overviewFilterSubject !== 'all' && grade.subject !== overviewFilterSubject) return false;
    if (overviewFilterTerm !== 'all' && grade.term !== overviewFilterTerm) return false;

    const studentName = grade.student?.fullName || grade.studentName || '';
    if (searchQuery && !studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(displayedGrades.length / ITEMS_PER_PAGE);
  const paginatedGrades = displayedGrades.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (validTypes.includes(file.type) || extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
        setUploadedFile(file);
        setParsedMarks([]);
        setTermSummary([]);
        setValidationComplete(false);
        processFile(file);
      } else {
        toast({
          title: t('academicProgress.invalidFileType'),
          description: t('academicProgress.pleaseUploadCSVOrExcel'),
          variant: 'destructive',
        });
      }
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Filter out completely empty rows
      const filteredJson = rawJson.filter(row =>
        Object.values(row).some(val => val !== null && val !== undefined && val !== '')
      );

      const mappedRecords = filteredJson.map(row => {
        const achievedRaw = row.achievedScore ?? row.mark ?? row['Mark'];
        const maxRaw = row.maxScore ?? row['Max Score'] ?? 100;

        return {
          studentId: (row.studentId || row.idNumber || row['Student ID'])?.toString(),
          subject: row.subject || row['Subject'] || selectedSubject,
          term: row.term || row['Term'] || selectedTerm,
          grade: row.grade || row['Grade'] || row.class || row['Class'] || selectedClass,
          achievedScore: (achievedRaw !== undefined && achievedRaw !== '') ? Number(achievedRaw) : null,
          maxScore: (maxRaw !== undefined && maxRaw !== '') ? Number(maxRaw) : 100,
          assessmentType: row.assessmentType || row['Assessment Type'] || 'EXAM',
          assessmentTitle: row.assessmentTitle || row['Assessment Title'] || 'Bulk Upload',
          date: row.date || row['Date'] || new Date().toISOString().split('T')[0],
          remarks: row.remarks || row['Remarks'],
        };
      });

      setProcessingProgress(50);

      if (mappedRecords.length === 0) {
        sonnerToast.error("No data found in file");
        setIsProcessing(false);
        return;
      }

      try {
        const validationResults = await validateBulk(mappedRecords);
        setParsedMarks(validationResults.map((res: any) => ({
          studentId: res.studentIdNumber, // Use National ID if available
          studentName: res.studentName,
          mark: res.achievedScore,
          status: res.status,
          errorMessage: res.notes !== '-' ? res.notes : undefined,
          originalData: res,
        })));
        setValidationComplete(true);
        setProcessingProgress(100);
      } catch (err: any) {
        console.error("Bulk validation error:", err.response?.data || err.message);
        sonnerToast.error(`Failed to validate records: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    const validRecords = parsedMarks
      .filter(m => m.status === 'valid')
      .map(m => m.originalData);

    if (validRecords.length === 0) {
      sonnerToast.error("No valid records to upload");
      return;
    }

    try {
      const response = await createBulk(validRecords);
      sonnerToast.success(`Successfully uploaded ${response.data.successCount} records`);
      handleReset();
    } catch (err) {
      sonnerToast.error("Failed to upload records");
    }
  };

  const getGradeFromMark = (mark: number): string => {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
  };

  const handleDownloadTemplate = async (format: 'csv' | 'spreadsheet') => {
    try {
      const response = await academicApi.downloadTemplate(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = format === 'csv' ? 'marks_template.csv' : 'marks_template.xls';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      sonnerToast.error("Failed to download template");
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setParsedMarks([]);
    setTermSummary([]);
    setValidationComplete(false);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    handleReset();
  };

  // Overview handlers
  const handleEditGrade = (record: any) => {
    setEditingId(record.id);
    const existingMark = record.achievedScore ?? record.mark;
    setEditingMark(existingMark?.toString() || '0');
  };

  const handleSaveEdit = (id: string) => {
    const mark = parseInt(editingMark, 10);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      sonnerToast.error(t('academicProgress.invalidMark'));
      return;
    }

    setPendingAction({ type: 'update', id, data: { achievedScore: mark } });
    setShowReasonDialog(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMark('');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setPendingAction({ type: 'delete', id });
    setShowReasonDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!actionReason) {
      sonnerToast.error("Reason is required");
      return;
    }

    try {
      if (pendingAction?.type === 'update') {
        await updateRecord({ ...pendingAction.data, changeReason: actionReason });
        sonnerToast.success("Grade updated successfully");
        setEditingId(null);
      } else if (pendingAction?.type === 'delete') {
        await deleteRecord({ id: pendingAction.id, reason: actionReason });
        sonnerToast.success("Grade deleted successfully");
      }
      setShowReasonDialog(false);
      setActionReason('');
      setPendingAction(null);
    } catch (error) {
      sonnerToast.error("Action failed");
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const [manualAddOpen, setManualAddOpen] = useState(false);

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Loading school configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('academicProgress.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('academicProgress.subtitle')}</p>
        </div>
        <Button onClick={() => setManualAddOpen(true)} className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          {t('academicProgress.addMarkManually')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="grade-input">{t('academicProgress.gradeInput')}</TabsTrigger>
          <TabsTrigger value="overview">{t('academicProgress.overview')}</TabsTrigger>
        </TabsList>

        {/* Grade Input Tab */}
        <TabsContent value="grade-input" className="space-y-6 mt-6">
          {/* Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('academicProgress.selectOptions')}</CardTitle>
              <CardDescription>{t('academicProgress.selectOptionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('academicProgress.term')}</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.selectTerm')} />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('academicProgress.class')}</Label>
                  <Select value={selectedClass} onValueChange={(value) => {
                    setSelectedClass(value);
                    handleReset();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.selectClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('academicProgress.subject')}</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.selectSubject')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('academicProgress.uploadFile')}</CardTitle>
                <CardDescription>{t('academicProgress.uploadFileDesc')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate('csv')} className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate('spreadsheet')} className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Spreadsheet Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    canUpload
                      ? 'border-border hover:border-primary cursor-pointer'
                      : 'border-muted bg-muted/30 cursor-not-allowed'
                  )}
                  onClick={() => canUpload && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!canUpload}
                  />
                  <Upload className={cn('h-12 w-12 mx-auto mb-4', canUpload ? 'text-muted-foreground' : 'text-muted')} />
                  <p className={cn('text-sm font-medium', canUpload ? 'text-foreground' : 'text-muted-foreground')}>
                    {canUpload ? t('academicProgress.clickToUpload') : t('academicProgress.selectOptionsFirst')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('academicProgress.supportedFormats')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm">{t('academicProgress.processingFile')}</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Preview Table */}
          {validationComplete && parsedMarks.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{t('academicProgress.validationPreview')}</CardTitle>
                    <CardDescription>
                      {t('academicProgress.validationSummary', {
                        valid: parsedMarks.filter(m => m.status === 'valid').length,
                        total: parsedMarks.length,
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {invalidCount > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {t('academicProgress.issuesFound', { count: invalidCount })}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t('academicProgress.studentId')}</TableHead>
                        <TableHead>{t('academicProgress.studentName')}</TableHead>
                        <TableHead className="text-center">{t('academicProgress.mark')}</TableHead>
                        <TableHead>{t('academicProgress.notes')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedMarks.map((mark, index) => (
                        <TableRow
                          key={index}
                          className={cn(
                            mark.status !== 'valid' && 'bg-destructive/5'
                          )}
                        >
                          <TableCell className="font-mono text-sm">{mark.studentId}</TableCell>
                          <TableCell>{mark.studentName}</TableCell>
                          <TableCell className="text-center font-medium">
                            {mark.mark !== null ? mark.mark : '-'}
                          </TableCell>
                          <TableCell className={cn(
                            "text-sm",
                            mark.status === 'invalid' && "text-destructive font-medium",
                            mark.status === 'missing' && "text-yellow-600 font-medium",
                            mark.status === 'valid' && "text-muted-foreground"
                          )}>
                            {mark.errorMessage || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={handleReset}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isProcessing || !parsedMarks.some(m => m.status === 'valid') || isCreatingBulk}
                    className="flex items-center gap-2"
                  >
                    {isCreatingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {t('academicProgress.confirmAndSave')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {termSummary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('academicProgress.termSummary')}</CardTitle>
                <CardDescription>
                  {selectedTerm} - {selectedClass} - {selectedSubject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {termSummary.length}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('academicProgress.totalStudents')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {termSummary.filter(s => s.status === 'Pass').length}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('academicProgress.passed')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-destructive">
                      {termSummary.filter(s => s.status === 'Fail').length}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('academicProgress.failed')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">
                      {(termSummary.reduce((sum, s) => sum + s.mark, 0) / termSummary.length).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('academicProgress.classAverage')}</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{t('academicProgress.studentId')}</TableHead>
                        <TableHead>{t('academicProgress.studentName')}</TableHead>
                        <TableHead className="text-center">{t('academicProgress.mark')}</TableHead>
                        <TableHead className="text-center">{t('academicProgress.grade')}</TableHead>
                        <TableHead className="text-center">{t('common.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {termSummary.map((summary, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{summary.studentId}</TableCell>
                          <TableCell>{summary.studentName}</TableCell>
                          <TableCell className="text-center font-medium">{summary.mark}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn(
                              summary.grade === 'A' && 'bg-green-500/10 text-green-600 border-green-200',
                              summary.grade === 'B' && 'bg-blue-500/10 text-blue-600 border-blue-200',
                              summary.grade === 'C' && 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
                              summary.grade === 'D' && 'bg-orange-500/10 text-orange-600 border-orange-200',
                              summary.grade === 'F' && 'bg-destructive/10 text-destructive border-destructive/20',
                            )}>
                              {summary.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={summary.status === 'Pass' ? 'default' : 'destructive'}>
                              {summary.status === 'Pass' ? t('academicProgress.pass') : t('academicProgress.fail')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('academicProgress.filterGrades')}</CardTitle>
              <CardDescription>{t('academicProgress.filterGradesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('academicProgress.class')}</Label>
                  <Select
                    value={overviewFilterClass}
                    onValueChange={(value) => {
                      setOverviewFilterClass(value);
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.allClasses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('academicProgress.allClasses')}</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('academicProgress.subject')}</Label>
                  <Select
                    value={overviewFilterSubject}
                    onValueChange={(value) => {
                      setOverviewFilterSubject(value);
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.allSubjects')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('academicProgress.allSubjects')}</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('academicProgress.term')}</Label>
                  <Select
                    value={overviewFilterTerm}
                    onValueChange={(value) => {
                      setOverviewFilterTerm(value);
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicProgress.allTerms')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('academicProgress.allTerms')}</SelectItem>
                      {terms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{t('academicProgress.gradesOverview')}</CardTitle>
                  <CardDescription>
                    {t('academicProgress.showingRecords', {
                      from: Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, displayedGrades.length),
                      to: Math.min(currentPage * ITEMS_PER_PAGE, displayedGrades.length),
                      total: displayedGrades.length
                    })}
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('academicProgress.searchByStudent')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingGrades ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : displayedGrades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t('academicProgress.noGradesFound')}
                </div>
              ) : (
                <>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>{t('academicProgress.studentId')}</TableHead>
                          <TableHead>{t('academicProgress.studentName')}</TableHead>
                          <TableHead>{t('academicProgress.class')}</TableHead>
                          <TableHead>{t('academicProgress.subject')}</TableHead>
                          <TableHead>{t('academicProgress.term')}</TableHead>
                          <TableHead className="text-center">Assessment</TableHead>
                          <TableHead className="text-center">{t('academicProgress.mark')}</TableHead>
                          <TableHead className="text-center">{t('academicProgress.grade')}</TableHead>
                          <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedGrades.map((record: any) => {
                          const achievedScore = record.achievedScore ?? record.mark;
                          const maxScore = record.maxScore || 100;
                          const percentage = Math.round((achievedScore / maxScore) * 100);
                          const studentName = record.student?.fullName || record.studentName;
                          const nationalId = record.student?.idNumber || record.studentId;
                          const gradeChar = record.grade || (percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F');

                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-mono text-sm">{nationalId || '—'}</TableCell>
                              <TableCell className="font-medium">{studentName || 'Unknown Student'}</TableCell>
                              <TableCell>{record.grade || record.class}</TableCell>
                              <TableCell>{record.subject}</TableCell>
                              <TableCell>{record.term}</TableCell>
                              <TableCell className="text-center text-xs">{record.assessmentTitle || 'Final'}</TableCell>
                              <TableCell className="text-center">
                                {editingId === record.id ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editingMark}
                                    onChange={(e) => setEditingMark(e.target.value)}
                                    className="w-20 text-center mx-auto"
                                  />
                                ) : (
                                  <span className="font-medium">{percentage}%</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={cn(
                                  gradeChar === 'A' && 'bg-green-500/10 text-green-600 border-green-200',
                                  gradeChar === 'B' && 'bg-blue-500/10 text-blue-600 border-blue-200',
                                  gradeChar === 'C' && 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
                                  gradeChar === 'D' && 'bg-orange-500/10 text-orange-600 border-orange-200',
                                  gradeChar === 'F' && 'bg-destructive/10 text-destructive border-destructive/20',
                                )}>
                                  {gradeChar}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {editingId === record.id ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSaveEdit(record.id)}
                                      >
                                        <Save className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancelEdit}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditGrade(record)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(record.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                            />
                          </PaginationItem>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reason Dialog */}
      <AlertDialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Reason</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for this {pendingAction?.type === 'update' ? 'update' : 'deletion'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="e.g., Data entry error"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowReasonDialog(false);
              setActionReason('');
              setPendingAction(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={!actionReason || isUpdating || isDeleting}>
              {(isUpdating || isDeleting) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual Add Dialog */}
      <AlertDialog open={manualAddOpen} onOpenChange={setManualAddOpen}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              studentId: formData.get('studentId') as string,
              term: formData.get('term') as string,
              date: formData.get('date') as string,
              grade: formData.get('grade') as string,
              subject: formData.get('subject') as string,
              assessmentType: formData.get('assessmentType') as string,
              assessmentTitle: formData.get('assessmentTitle') as string,
              maxScore: Number(formData.get('maxScore')),
              achievedScore: Number(formData.get('achievedScore')),
            };
            try {
              await createRecord(data as any);
              sonnerToast.success("Mark added successfully");
              setManualAddOpen(false);
            } catch (err) {
              sonnerToast.error("Failed to add mark");
            }
          }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Mark Manually</AlertDialogTitle>
              <AlertDialogDescription>
                Fill in the details to add a student's academic record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Student ID (National ID)</Label>
                <Input name="studentId" required className="col-span-3" placeholder="e.g., 9001015800081" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <Input name="date" type="date" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Term</Label>
                <Select name="term" defaultValue="Term 1">
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Grade/Class</Label>
                <Select name="grade" defaultValue={classes[0]}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Subject</Label>
                <Select name="subject" defaultValue={subjects[0]}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assessment Type</Label>
                <Select name="assessmentType" defaultValue="EXAM">
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="CONTROL_TEST">Control Test</SelectItem>
                    <SelectItem value="HOMEWORK">Homework</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="PRACTICAL">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assessment Title</Label>
                <Input name="assessmentTitle" required className="col-span-3" placeholder="e.g., Algebra Midterm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Achieved Mark</Label>
                  <Input name="achievedScore" type="number" required placeholder="0" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Max Mark</Label>
                  <Input name="maxScore" type="number" required placeholder="100" />
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Mark
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
