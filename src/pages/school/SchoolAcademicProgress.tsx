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

// Mock data for dropdowns
const terms = ['Term 1', 'Term 2', 'Term 3', 'Term 4'];
const classes = ['Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B', 'Grade 11-A', 'Grade 11-B'];
const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education'];

// Mock student data for validation
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

// Mock saved grades data for overview
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

const getGradeFromMarkStatic = (mark: number): string => {
  if (mark >= 80) return 'A';
  if (mark >= 70) return 'B';
  if (mark >= 60) return 'C';
  if (mark >= 50) return 'D';
  return 'F';
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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canUpload = selectedTerm && selectedClass && selectedSubject;
  const hasValidMarks = parsedMarks.some(m => m.status === 'valid');
  const invalidCount = parsedMarks.filter(m => m.status !== 'valid').length;

  // Filter grades for overview
  const filteredGrades = overviewGrades.filter(grade => {
    if (overviewFilterClass !== 'all' && grade.class !== overviewFilterClass) return false;
    if (overviewFilterSubject !== 'all' && grade.subject !== overviewFilterSubject) return false;
    if (overviewFilterTerm !== 'all' && grade.term !== overviewFilterTerm) return false;
    if (searchQuery && !grade.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredGrades.length / ITEMS_PER_PAGE);
  const paginatedGrades = filteredGrades.slice(
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
        simulateFileProcessing(file);
      } else {
        toast({
          title: t('academicProgress.invalidFileType'),
          description: t('academicProgress.pleaseUploadCSVOrExcel'),
          variant: 'destructive',
        });
      }
    }
  };

  const simulateFileProcessing = (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      const students = mockClassStudents[selectedClass] || [];
      const mockParsedData: ParsedMark[] = students.map((student, index) => {
        if (index === 0) {
          return {
            studentId: student.id,
            studentName: student.name,
            mark: Math.floor(Math.random() * 40) + 60,
            status: 'valid' as const,
          };
        } else if (index === 1 && students.length > 2) {
          return {
            studentId: student.id,
            studentName: student.name,
            mark: null,
            status: 'missing' as const,
            errorMessage: t('academicProgress.markMissing'),
          };
        } else if (index === 2 && students.length > 3) {
          return {
            studentId: student.id,
            studentName: student.name,
            mark: 150,
            status: 'invalid' as const,
            errorMessage: t('academicProgress.markOutOfRange'),
          };
        } else {
          return {
            studentId: student.id,
            studentName: student.name,
            mark: Math.floor(Math.random() * 50) + 50,
            status: 'valid' as const,
          };
        }
      });

      mockParsedData.push({
        studentId: 'UNKNOWN001',
        studentName: 'Unknown Student',
        mark: 75,
        status: 'invalid' as const,
        errorMessage: t('academicProgress.studentNotFound'),
      });

      setParsedMarks(mockParsedData);
      setIsProcessing(false);
      setValidationComplete(true);
    }, 1800);
  };

  const getGradeFromMark = (mark: number): string => {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
  };

  const handleSaveMarks = () => {
    const validMarks = parsedMarks.filter(m => m.status === 'valid' && m.mark !== null);
    
    const summary: TermSummary[] = validMarks.map(m => ({
      studentId: m.studentId,
      studentName: m.studentName,
      mark: m.mark!,
      grade: getGradeFromMark(m.mark!),
      status: m.mark! >= 50 ? 'Pass' : 'Fail',
    }));

    setTermSummary(summary);

    toast({
      title: t('academicProgress.marksImported'),
      description: t('academicProgress.marksImportedDesc', { count: validMarks.length }),
    });
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
  const handleEditGrade = (record: GradeRecord) => {
    setEditingId(record.id);
    setEditingMark(record.mark.toString());
  };

  const handleSaveEdit = (id: number) => {
    const mark = parseInt(editingMark, 10);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      toast({
        title: t('academicProgress.invalidMark'),
        description: t('academicProgress.markMustBeBetween'),
        variant: 'destructive',
      });
      return;
    }

    setOverviewGrades(prev =>
      prev.map(g =>
        g.id === id
          ? {
              ...g,
              mark,
              grade: getGradeFromMark(mark),
              status: mark >= 50 ? 'Pass' : 'Fail',
            }
          : g
      )
    );
    setEditingId(null);
    setEditingMark('');
    toast({
      title: t('academicProgress.gradeUpdated'),
      description: t('academicProgress.gradeUpdatedDesc'),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMark('');
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId !== null) {
      setOverviewGrades(prev => prev.filter(g => g.id !== deletingId));
      toast({
        title: t('academicProgress.gradeDeleted'),
        description: t('academicProgress.gradeDeletedDesc'),
      });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('academicProgress.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('academicProgress.subtitle')}</p>
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
            <CardHeader>
              <CardTitle className="text-lg">{t('academicProgress.uploadFile')}</CardTitle>
              <CardDescription>{t('academicProgress.uploadFileDesc')}</CardDescription>
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
                        <TableHead>{t('common.status')}</TableHead>
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
                          <TableCell>
                            {mark.status === 'valid' ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('academicProgress.valid')}
                              </Badge>
                            ) : mark.status === 'missing' ? (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {t('academicProgress.missing')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {t('academicProgress.invalid')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
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
                    onClick={handleSaveMarks}
                    disabled={!hasValidMarks}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('academicProgress.confirmAndSave')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Term Summary */}
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
                      from: Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredGrades.length),
                      to: Math.min(currentPage * ITEMS_PER_PAGE, filteredGrades.length),
                      total: filteredGrades.length 
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
              {filteredGrades.length === 0 ? (
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
                          <TableHead className="text-center">{t('academicProgress.mark')}</TableHead>
                          <TableHead className="text-center">{t('academicProgress.grade')}</TableHead>
                          <TableHead className="text-center">{t('common.status')}</TableHead>
                          <TableHead className="text-right">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedGrades.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                            <TableCell>{record.studentName}</TableCell>
                            <TableCell>{record.class}</TableCell>
                            <TableCell>{record.subject}</TableCell>
                            <TableCell>{record.term}</TableCell>
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
                                <span className="font-medium">{record.mark}%</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={cn(
                                record.grade === 'A' && 'bg-green-500/10 text-green-600 border-green-200',
                                record.grade === 'B' && 'bg-blue-500/10 text-blue-600 border-blue-200',
                                record.grade === 'C' && 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
                                record.grade === 'D' && 'bg-orange-500/10 text-orange-600 border-orange-200',
                                record.grade === 'F' && 'bg-destructive/10 text-destructive border-destructive/20',
                              )}>
                                {record.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={record.status === 'Pass' ? 'default' : 'destructive'}>
                                {record.status === 'Pass' ? t('academicProgress.pass') : t('academicProgress.fail')}
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
                        ))}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('academicProgress.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('academicProgress.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
