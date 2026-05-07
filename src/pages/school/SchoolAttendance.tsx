import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2, Search, Download, FileText, CalendarIcon, Pencil, Trash2, Save } from 'lucide-react';
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
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, isAfter } from 'date-fns';
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
import { toast as sonnerToast } from 'sonner';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/AuthContext';
import { useUserWithProfile } from '@/hooks/users/user.hook';
import {
  useAttendance,
  useAttendanceSummary,
  useBulkValidateAttendance,
  useBulkCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance
} from '@/hooks/attendance.hook';
import { Skeleton } from '@/components/ui/skeleton';

interface ParsedAttendance {
  studentIdNumber: string;
  names: string;
  surname: string;
  grade: string;
  subject: string;
  status: 'PRESENT' | 'ABSENT' | null;
  date: string;
  term: string;
  capturedBy: string;
  validationStatus: 'valid' | 'invalid' | 'missing';
  errorMessage?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  idNumber?: string;
  grade: string;
  status: 'PRESENT' | 'ABSENT';
}

const ITEMS_PER_PAGE = 10;

export default function SchoolAttendance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserWithProfile(user?.sub || '');
  const schoolProfile = userProfile?.schoolAdminProfile?.school;
  const offeredGrades = schoolProfile?.gradesOffered || [];

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

  // Hooks
  const { data: realRecords, isLoading: isLoadingRecords } = useAttendance({
    grade: activeTab === 'reports' 
      ? (reportClass === 'all' ? undefined : reportClass)
      : (filterClass === 'all' ? undefined : filterClass),
    date: activeTab === 'upload' 
      ? format(selectedDate || new Date(), 'yyyy-MM-dd')
      : activeTab === 'records' && filterDateRange === 'today' 
        ? format(new Date(), 'yyyy-MM-dd') 
        : undefined,
    startDate: activeTab === 'reports' 
      ? format(startOfMonth(parseISO(`${reportMonth}-01`)), 'yyyy-MM-dd')
      : undefined,
    endDate: activeTab === 'reports' 
      ? format(endOfMonth(parseISO(`${reportMonth}-01`)), 'yyyy-MM-dd')
      : undefined,
  });

  const { data: summaryData } = useAttendanceSummary({
    grade: activeTab === 'reports' 
      ? (reportClass === 'all' ? undefined : reportClass)
      : (filterClass === 'all' ? undefined : filterClass),
    startDate: activeTab === 'reports' 
      ? format(startOfMonth(parseISO(`${reportMonth}-01`)), 'yyyy-MM-dd')
      : undefined,
    endDate: activeTab === 'reports' 
      ? format(endOfMonth(parseISO(`${reportMonth}-01`)), 'yyyy-MM-dd')
      : undefined,
  });

  const { mutateAsync: validateBulk, isPending: isValidatingBulk } = useBulkValidateAttendance();
  const { mutateAsync: createBulk, isPending: isCreatingBulk } = useBulkCreateAttendance();
  const { mutateAsync: updateRecord } = useUpdateAttendance();
  const { mutateAsync: deleteRecord } = useDeleteAttendance();

  const canUpload = selectedClass && selectedDate;
  const hasValidRecords = parsedAttendance.some(r => r.validationStatus === 'valid');
  const invalidCount = parsedAttendance.filter(r => r.validationStatus !== 'valid').length;

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    const dataToFilter = realRecords || [];
    return dataToFilter.filter((record: any) => {
      // Search filter
      const studentName = record.student?.fullName || record.studentName || '';
      const studentId = record.student?.idNumber || record.studentId || '';
      if (searchQuery && !studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !studentId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [realRecords, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredRecords, currentPage]);

  // Calculate statistics from summaryData
  const presentCount = summaryData?.presentCount || 0;
  const absentCount = summaryData?.absentCount || 0;
  const attendanceRate = summaryData?.attendanceRate || 0;

  // Get students with repeated absences
  const repeatedAbsences = useMemo(() => {
    const data = realRecords || [];
    const absencesByStudent: Record<string, { name: string; count: number; lastDate: string }> = {};
    
    data.filter((r: any) => r.status === 'ABSENT').forEach((record: any) => {
      const studentId = record.student?.idNumber || record.studentId;
      if (!absencesByStudent[studentId]) {
        absencesByStudent[studentId] = {
          name: record.student?.fullName || record.studentName,
          count: 0,
          lastDate: record.date
        };
      }
      absencesByStudent[studentId].count++;
      if (isAfter(parseISO(record.date), parseISO(absencesByStudent[studentId].lastDate))) {
        absencesByStudent[studentId].lastDate = record.date;
      }
    });

    return Object.values(absencesByStudent).filter(s => s.count >= 3);
  }, [realRecords]);

  const reportStats = useMemo(() => {
    const stats: Record<string, { name: string, grade: string, present: number, absent: number }> = {};
    filteredRecords.forEach(r => {
      const sid = r.student?.id || r.studentId;
      if (!stats[sid]) stats[sid] = { name: r.student?.fullName || r.studentName, grade: r.grade, present: 0, absent: 0 };
      if (r.status === 'PRESENT') stats[sid].present++;
      else stats[sid].absent++;
    });
    return Object.values(stats);
  }, [filteredRecords]);

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadTemplate = (fileFormat: 'csv' | 'xlsx') => {
    const headers = [
      'studentIdNumber',
      'names',
      'surname',
      'grade',
      'subject',
      'status',
      'date',
      'term',
      'capturedBy'
    ];
    
    const sampleData = [
      {
        studentIdNumber: 'STU001',
        names: 'John',
        surname: 'Doe',
        grade: selectedClass || 'Grade 10A',
        subject: 'Mathematics',
        status: 'PRESENT',
        date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
        term: 'Term 1',
        capturedBy: userProfile?.fullName || 'Teacher Name'
      }
    ];

    if (fileFormat === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Template');
      XLSX.writeFile(wb, 'attendance_template.xlsx');
    } else {
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'attendance_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: t('common.downloadStarted'),
      description: t('attendance.templateDownloaded'),
    });
  };

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
        processFile(file);
      } else {
        toast({
          title: t('attendance.invalidFileType'),
          description: t('attendance.pleaseUploadCSVOrExcel'),
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
        const statusRaw = (row.status || row.present_or_absent || row['Status'] || 'PRESENT').toString().toUpperCase();
        const status = (statusRaw === 'PRESENT' || statusRaw === 'ABSENT') ? statusRaw : 'PRESENT';
        
        return {
          studentIdNumber: (row.studentIdNumber || row.idNumber || row['Student ID Number'] || row['Student ID'])?.toString(),
          names: row.names || row.firstName || row['Names'] || row['First Name'],
          surname: row.surname || row.lastName || row['Surname'] || row['Last Name'],
          status: status,
          date: row.date || row['Date'] || format(selectedDate!, 'yyyy-MM-dd'),
          grade: row.grade || row.class || row['Grade'] || row['Class'] || selectedClass,
          period: row.period || row['Period'] || '1',
          subject: row.subject || row['Subject'] || 'General',
          term: row.term || row['Term'] || 'Term 1',
          capturedBy: row.capturedBy || row['Captured By'] || userProfile?.fullName || '',
          remarks: row.remarks || row['Remarks'],
        };
      });

      setProcessingProgress(50);

      try {
        const validated = await validateBulk(mappedRecords);
        setParsedAttendance(validated);
        setProcessingProgress(100);
        setValidationComplete(true);
      } catch (error) {
        sonnerToast.error("Failed to validate file");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveAttendance = async () => {
    const validRecords = parsedAttendance.filter(r => r.validationStatus === 'valid' && r.status !== null);
    
    try {
      await createBulk(validRecords);
      toast({
        title: t('attendance.attendanceImported'),
        description: t('attendance.attendanceImportedDesc', { count: validRecords.length }),
      });
      handleReset();
    } catch (error) {
      sonnerToast.error("Failed to save attendance");
    }
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
    const [year, month] = reportMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    // We'll use the data from the realRecords but filter it for the report specific criteria
    // In a real app, you might want to fetch this specifically
    const reportRecords = (realRecords || []).filter((record: any) => {
      const recordDate = parseISO(record.date);
      const classMatch = reportClass === 'all' || (record.class || record.grade) === reportClass;
      const dateMatch = isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
      return classMatch && dateMatch;
    });

    // Calculate statistics per student
    const studentStats: Record<string, { name: string; class: string; present: number; absent: number; total: number }> = {};
    
    reportRecords.forEach((record: any) => {
      const studentId = record.student?.idNumber || record.studentId;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          name: record.student?.fullName || record.studentName,
          class: record.grade || record.class,
          present: 0,
          absent: 0,
          total: 0,
        };
      }
      studentStats[studentId].total++;
      if (record.status === 'PRESENT') {
        studentStats[studentId].present++;
      } else {
        studentStats[studentId].absent++;
      }
    });

    const totalPresent = reportRecords.filter((r: any) => r.status === 'PRESENT').length;
    const totalAbsent = reportRecords.filter((r: any) => r.status === 'ABSENT').length;
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
                      {offeredGrades.map(cls => (
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

              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadTemplate('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('attendance.downloadCSVTemplate')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t('attendance.downloadExcelTemplate')}
                </Button>
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
                        <TableHead>{t('attendance.class')}</TableHead>
                        <TableHead>{t('attendance.subject')}</TableHead>
                        <TableHead>{t('attendance.status')}</TableHead>
                        <TableHead>{t('attendance.validation')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedAttendance.map((record, index) => (
                        <TableRow key={index} className={record.validationStatus !== 'valid' ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-mono text-xs">{record.studentIdNumber}</TableCell>
                          <TableCell>{record.names} {record.surname}</TableCell>
                          <TableCell className="text-xs">{record.grade}</TableCell>
                          <TableCell className="text-xs">{record.subject}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'destructive' : 'outline'} 
                              className="text-[10px]"
                            >
                              {record.status === 'PRESENT' || record.status === 'ABSENT' 
                                ? t(`attendance.${record.status.toLowerCase()}`) 
                                : record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.validationStatus === 'valid' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">{t('attendance.valid')}</span>
                              </div>
                            )}
                            {record.validationStatus === 'invalid' && (
                              <div className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">{record.errorMessage}</span>
                              </div>
                            )}
                            {record.validationStatus === 'missing' && (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">{record.errorMessage}</span>
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
                      {offeredGrades.map(cls => (
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
                    {isLoadingRecords ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {t('attendance.noRecordsFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(parseISO(record.date), 'PP')}</TableCell>
                          <TableCell className="font-mono text-sm">{record.student?.idNumber || record.studentId}</TableCell>
                          <TableCell>{record.student?.fullName || record.studentName}</TableCell>
                          <TableCell>{record.grade}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'PRESENT' ? 'default' : 'destructive'}
                              className={record.status === 'PRESENT' ? 'bg-green-500 hover:bg-green-600' : ''}>
                              {record.status === 'PRESENT' ? t('attendance.present') : t('attendance.absent')}
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
                      {repeatedAbsences.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.name}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{data.count} {t('attendance.days')}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{format(parseISO(data.lastDate), 'PP')}</TableCell>
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
                      {offeredGrades.map(cls => (
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
                <div className="text-2xl font-bold">{realRecords?.length || 0}</div>
                <p className="text-xs text-muted-foreground">{t('attendance.totalRecords')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceRate}%
                </div>
                <p className="text-xs text-muted-foreground">{t('attendance.overallAttendance')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{offeredGrades.length}</div>
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

          {/* Report Preview / Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('attendance.reportPreview')}</CardTitle>
              <CardDescription>{t('attendance.reportPreviewDesc', { month: reportMonth })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('attendance.studentName')}</TableHead>
                      <TableHead>{t('attendance.class')}</TableHead>
                      <TableHead>{t('attendance.present')}</TableHead>
                      <TableHead>{t('attendance.absent')}</TableHead>
                      <TableHead>{t('attendance.attendanceRate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRecords ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">{t('attendance.noRecordsForMonth')}</TableCell></TableRow>
                    ) : (
                      reportStats.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell className="text-xs">{s.grade}</TableCell>
                          <TableCell className="text-green-600 font-medium">{s.present}</TableCell>
                          <TableCell className="text-destructive font-medium">{s.absent}</TableCell>
                          <TableCell>
                            {Math.round((s.present / (s.present + s.absent)) * 100)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
