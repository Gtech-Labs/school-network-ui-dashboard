import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2, Search, Download, FileText, CalendarIcon } from 'lucide-react';
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
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Mock data for dropdowns
const classes = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B'];

// Mock student data
const mockClassStudents: Record<string, Array<{ id: string; name: string }>> = {
  'Grade 5': [
    { id: 'STU001', name: 'Emma Johnson' },
    { id: 'STU002', name: 'Liam Smith' },
    { id: 'STU003', name: 'Sophia Williams' },
    { id: 'STU004', name: 'Noah Brown' },
    { id: 'STU005', name: 'Olivia Davis' },
  ],
  'Grade 6': [
    { id: 'STU006', name: 'James Wilson' },
    { id: 'STU007', name: 'Ava Martinez' },
    { id: 'STU008', name: 'William Anderson' },
    { id: 'STU009', name: 'Isabella Thomas' },
    { id: 'STU010', name: 'Benjamin Taylor' },
  ],
  'Grade 7': [
    { id: 'STU011', name: 'Mia Jackson' },
    { id: 'STU012', name: 'Lucas White' },
    { id: 'STU013', name: 'Charlotte Harris' },
    { id: 'STU014', name: 'Henry Martin' },
  ],
  'Grade 9-A': [
    { id: 'STU015', name: 'Amelia Thompson' },
    { id: 'STU016', name: 'Alexander Garcia' },
    { id: 'STU017', name: 'Harper Robinson' },
  ],
  'Grade 10-A': [
    { id: 'STU018', name: 'Ethan Clark' },
    { id: 'STU019', name: 'Evelyn Rodriguez' },
    { id: 'STU020', name: 'Michael Lewis' },
    { id: 'STU021', name: 'Abigail Lee' },
  ],
};

interface ParsedAttendance {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | null;
  validationStatus: 'valid' | 'invalid' | 'missing';
  errorMessage?: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  studentId: string;
  studentName: string;
  class: string;
  status: 'present' | 'absent';
}

// Generate mock attendance records
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  let id = 1;
  const today = new Date();
  
  Object.entries(mockClassStudents).forEach(([className, students]) => {
    students.forEach(student => {
      // Generate attendance for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
          records.push({
            id: id++,
            date: format(date, 'yyyy-MM-dd'),
            studentId: student.id,
            studentName: student.name,
            class: className,
            status: Math.random() > 0.15 ? 'present' : 'absent', // 85% attendance rate
          });
        }
      }
    });
  });
  
  return records;
};

const ITEMS_PER_PAGE = 10;

export default function SchoolAttendance() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('upload');

  // Upload form state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [parsedAttendance, setParsedAttendance] = useState<ParsedAttendance[]>([]);
  const [validationComplete, setValidationComplete] = useState(false);

  // Attendance records state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => generateMockAttendance());
  
  // Filter state
  const [filterClass, setFilterClass] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('thisMonth');
  const [filterCustomFrom, setFilterCustomFrom] = useState<Date | undefined>();
  const [filterCustomTo, setFilterCustomTo] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Report state
  const [reportClass, setReportClass] = useState('all');
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));

  const canUpload = selectedClass && selectedDate;
  const hasValidRecords = parsedAttendance.some(r => r.validationStatus === 'valid');
  const invalidCount = parsedAttendance.filter(r => r.validationStatus !== 'valid').length;

  // Filter attendance records
  const getFilteredRecords = () => {
    return attendanceRecords.filter(record => {
      // Class filter
      if (filterClass !== 'all' && record.class !== filterClass) return false;
      
      // Date range filter
      const recordDate = parseISO(record.date);
      const today = new Date();
      
      if (filterDateRange === 'today') {
        if (format(recordDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) return false;
      } else if (filterDateRange === 'last7Days') {
        const weekAgo = subDays(today, 7);
        if (!isWithinInterval(recordDate, { start: weekAgo, end: today })) return false;
      } else if (filterDateRange === 'thisMonth') {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        if (!isWithinInterval(recordDate, { start: monthStart, end: monthEnd })) return false;
      } else if (filterDateRange === 'custom' && filterCustomFrom && filterCustomTo) {
        if (!isWithinInterval(recordDate, { start: filterCustomFrom, end: filterCustomTo })) return false;
      }
      
      // Search filter
      if (searchQuery && !record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.studentId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const filteredRecords = getFilteredRecords();
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate statistics
  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = filteredRecords.length > 0 
    ? Math.round((presentCount / filteredRecords.length) * 100) 
    : 0;

  // Get students with repeated absences
  const getRepeatedAbsences = () => {
    const absenceCounts: Record<string, { name: string; class: string; count: number }> = {};
    
    filteredRecords.forEach(record => {
      if (record.status === 'absent') {
        if (!absenceCounts[record.studentId]) {
          absenceCounts[record.studentId] = { name: record.studentName, class: record.class, count: 0 };
        }
        absenceCounts[record.studentId].count++;
      }
    });
    
    return Object.entries(absenceCounts)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].count - a[1].count);
  };

  const repeatedAbsences = getRepeatedAbsences();

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
        setParsedAttendance([]);
        setValidationComplete(false);
        simulateFileProcessing();
      } else {
        toast({
          title: t('attendance.invalidFileType'),
          description: t('attendance.pleaseUploadCSVOrExcel'),
          variant: 'destructive',
        });
      }
    }
  };

  const simulateFileProcessing = () => {
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
      const mockParsedData: ParsedAttendance[] = students.map((student, index) => {
        if (index === 0) {
          return {
            studentId: student.id,
            studentName: student.name,
            status: 'present' as const,
            validationStatus: 'valid' as const,
          };
        } else if (index === 1 && students.length > 2) {
          return {
            studentId: student.id,
            studentName: student.name,
            status: null,
            validationStatus: 'missing' as const,
            errorMessage: t('attendance.statusMissing'),
          };
        } else {
          return {
            studentId: student.id,
            studentName: student.name,
            status: Math.random() > 0.2 ? 'present' : 'absent',
            validationStatus: 'valid' as const,
          };
        }
      });

      // Add an unknown student
      mockParsedData.push({
        studentId: 'UNKNOWN001',
        studentName: 'Unknown Student',
        status: 'present',
        validationStatus: 'invalid' as const,
        errorMessage: t('attendance.studentNotFound'),
      });

      setParsedAttendance(mockParsedData);
      setIsProcessing(false);
      setValidationComplete(true);
    }, 1800);
  };

  const handleSaveAttendance = () => {
    const validRecords = parsedAttendance.filter(r => r.validationStatus === 'valid' && r.status !== null);
    
    const newRecords: AttendanceRecord[] = validRecords.map((record, index) => ({
      id: Date.now() + index,
      date: format(selectedDate!, 'yyyy-MM-dd'),
      studentId: record.studentId,
      studentName: record.studentName,
      class: selectedClass,
      status: record.status as 'present' | 'absent',
    }));

    setAttendanceRecords(prev => [...newRecords, ...prev]);

    toast({
      title: t('attendance.attendanceImported'),
      description: t('attendance.attendanceImportedDesc', { count: validRecords.length }),
    });

    handleReset();
  };

  const handleReset = () => {
    setUploadedFile(null);
    setParsedAttendance([]);
    setValidationComplete(false);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Student ID', 'Student Name', 'Class', 'Status'].join(','),
      ...filteredRecords.map(r => [r.date, r.studentId, r.studentName, r.class, r.status].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t('attendance.exportSuccess'),
      description: t('attendance.exportSuccessDesc'),
    });
  };

  const handleGenerateReport = () => {
    // Filter records for the selected class and month
    const [year, month] = reportMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    const reportRecords = attendanceRecords.filter(record => {
      const recordDate = parseISO(record.date);
      const classMatch = reportClass === 'all' || record.class === reportClass;
      const dateMatch = isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
      return classMatch && dateMatch;
    });

    // Calculate statistics per student
    const studentStats: Record<string, { name: string; class: string; present: number; absent: number; total: number }> = {};
    
    reportRecords.forEach(record => {
      if (!studentStats[record.studentId]) {
        studentStats[record.studentId] = {
          name: record.studentName,
          class: record.class,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      studentStats[record.studentId].total++;
      if (record.status === 'present') {
        studentStats[record.studentId].present++;
      } else {
        studentStats[record.studentId].absent++;
      }
    });

    const totalPresent = reportRecords.filter(r => r.status === 'present').length;
    const totalAbsent = reportRecords.filter(r => r.status === 'absent').length;
    const overallRate = reportRecords.length > 0 ? Math.round((totalPresent / reportRecords.length) * 100) : 0;
    const monthName = format(monthStart, 'MMMM yyyy');

    // Generate PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${t('attendance.attendanceReport')} - ${monthName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Söhne', 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00A6FB; padding-bottom: 20px; }
          .header h1 { font-size: 24px; color: #003554; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-item .value { font-size: 28px; font-weight: bold; color: #00A6FB; }
          .summary-item .label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #003554; color: white; padding: 12px 8px; text-align: left; font-size: 12px; }
          td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .rate-good { color: #22c55e; font-weight: bold; }
          .rate-warning { color: #f59e0b; font-weight: bold; }
          .rate-bad { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('attendance.attendanceReport')}</h1>
          <p>${reportClass === 'all' ? t('attendance.allClasses') : reportClass} | ${monthName}</p>
          <p style="margin-top: 5px; font-size: 12px;">${t('attendance.generatedOn')}: ${format(new Date(), 'PPP')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="value">${reportRecords.length}</div>
            <div class="label">${t('attendance.totalRecords')}</div>
          </div>
          <div class="summary-item">
            <div class="value" style="color: #22c55e;">${totalPresent}</div>
            <div class="label">${t('attendance.totalPresent')}</div>
          </div>
          <div class="summary-item">
            <div class="value" style="color: #ef4444;">${totalAbsent}</div>
            <div class="label">${t('attendance.totalAbsent')}</div>
          </div>
          <div class="summary-item">
            <div class="value">${overallRate}%</div>
            <div class="label">${t('attendance.attendanceRate')}</div>
          </div>
        </div>
        
        <h3 style="margin-bottom: 10px; color: #003554;">${t('attendance.studentBreakdown')}</h3>
        <table>
          <thead>
            <tr>
              <th>${t('attendance.studentId')}</th>
              <th>${t('attendance.studentName')}</th>
              <th>${t('attendance.class')}</th>
              <th>${t('attendance.present')}</th>
              <th>${t('attendance.absent')}</th>
              <th>${t('attendance.attendanceRate')}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(studentStats).map(([id, stats]) => {
              const rate = Math.round((stats.present / stats.total) * 100);
              const rateClass = rate >= 90 ? 'rate-good' : rate >= 75 ? 'rate-warning' : 'rate-bad';
              return `
                <tr>
                  <td>${id}</td>
                  <td>${stats.name}</td>
                  <td>${stats.class}</td>
                  <td>${stats.present}</td>
                  <td>${stats.absent}</td>
                  <td class="${rateClass}">${rate}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>${t('attendance.reportFooter')}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    toast({
      title: t('attendance.reportGenerated'),
      description: t('attendance.reportGeneratedDesc'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('attendance.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('attendance.subtitle')}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="upload">{t('attendance.uploadTab')}</TabsTrigger>
          <TabsTrigger value="records">{t('attendance.recordsTab')}</TabsTrigger>
          <TabsTrigger value="reports">{t('attendance.reportsTab')}</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6 mt-6">
          {/* Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attendance.selectOptions')}</CardTitle>
              <CardDescription>{t('attendance.selectOptionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('attendance.class')}</Label>
                  <Select value={selectedClass} onValueChange={(value) => {
                    setSelectedClass(value);
                    handleReset();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('attendance.selectClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('attendance.date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : t('common.pickDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attendance.uploadFile')}</CardTitle>
              <CardDescription>{t('attendance.uploadFileDesc')}</CardDescription>
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
                    {canUpload ? t('attendance.clickToUpload') : t('attendance.selectOptionsFirst')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('attendance.supportedFormats')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('attendance.processingFile')}
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Preview */}
          {validationComplete && parsedAttendance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {t('attendance.validationPreview')}
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {t('attendance.issuesFound', { count: invalidCount })}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {t('attendance.validationSummary', { 
                    valid: parsedAttendance.filter(r => r.validationStatus === 'valid').length,
                    total: parsedAttendance.length 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('attendance.studentId')}</TableHead>
                        <TableHead>{t('attendance.studentName')}</TableHead>
                        <TableHead>{t('attendance.status')}</TableHead>
                        <TableHead>{t('attendance.validation')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedAttendance.map((record, index) => (
                        <TableRow key={index} className={record.validationStatus !== 'valid' ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                          <TableCell>{record.studentName}</TableCell>
                          <TableCell>
                            {record.status === 'present' && (
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                {t('attendance.present')}
                              </Badge>
                            )}
                            {record.status === 'absent' && (
                              <Badge variant="destructive">
                                {t('attendance.absent')}
                              </Badge>
                            )}
                            {record.status === null && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.validationStatus === 'valid' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">{t('attendance.valid')}</span>
                              </div>
                            )}
                            {record.validationStatus === 'invalid' && (
                              <div className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{record.errorMessage}</span>
                              </div>
                            )}
                            {record.validationStatus === 'missing' && (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{record.errorMessage}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={handleReset}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSaveAttendance} disabled={!hasValidRecords}>
                    {t('attendance.confirmAndSave')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.totalPresent')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">{absentCount}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.totalAbsent')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">{t('attendance.attendanceRate')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('common.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('attendance.class')}</Label>
                  <Select value={filterClass} onValueChange={(v) => { setFilterClass(v); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('attendance.allClasses')}</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('attendance.dateRange')}</Label>
                  <Select value={filterDateRange} onValueChange={(v) => { setFilterDateRange(v); setCurrentPage(1); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">{t('common.today')}</SelectItem>
                      <SelectItem value="last7Days">{t('common.last7Days')}</SelectItem>
                      <SelectItem value="thisMonth">{t('common.thisMonth')}</SelectItem>
                      <SelectItem value="custom">{t('common.customRange')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterDateRange === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('common.fromDate')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterCustomFrom ? format(filterCustomFrom, 'PP') : t('common.pickDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filterCustomFrom}
                            onSelect={setFilterCustomFrom}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.toDate')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterCustomTo ? format(filterCustomTo, 'PP') : t('common.pickDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filterCustomTo}
                            onSelect={setFilterCustomTo}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('attendance.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('common.export')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attendance.attendanceRecords')}</CardTitle>
              <CardDescription>
                {t('attendance.showingRecords', { 
                  from: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  to: Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length),
                  total: filteredRecords.length 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('attendance.date')}</TableHead>
                      <TableHead>{t('attendance.studentId')}</TableHead>
                      <TableHead>{t('attendance.studentName')}</TableHead>
                      <TableHead>{t('attendance.class')}</TableHead>
                      <TableHead>{t('attendance.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {t('attendance.noRecordsFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(parseISO(record.date), 'PP')}</TableCell>
                          <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                          <TableCell>{record.studentName}</TableCell>
                          <TableCell>{record.class}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}
                              className={record.status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}>
                              {record.status === 'present' ? t('attendance.present') : t('attendance.absent')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repeated Absences Alert */}
          {repeatedAbsences.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  {t('attendance.repeatedAbsences')}
                </CardTitle>
                <CardDescription>{t('attendance.repeatedAbsencesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('attendance.studentName')}</TableHead>
                        <TableHead>{t('attendance.class')}</TableHead>
                        <TableHead>{t('attendance.absenceCount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repeatedAbsences.map(([id, data]) => (
                        <TableRow key={id}>
                          <TableCell>{data.name}</TableCell>
                          <TableCell>{data.class}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{data.count} {t('attendance.days')}</Badge>
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attendance.generateReport')}</CardTitle>
              <CardDescription>{t('attendance.generateReportDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('attendance.class')}</Label>
                  <Select value={reportClass} onValueChange={setReportClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('attendance.allClasses')}</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('attendance.month')}</Label>
                  <Input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleGenerateReport} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    {t('attendance.generateReport')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{attendanceRecords.length}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.totalRecords')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">{t('attendance.overallAttendance')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{Object.keys(mockClassStudents).length}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.classesTracked')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-destructive">{repeatedAbsences.length}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.studentsAtRisk')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
