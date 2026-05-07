import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Activity, Filter, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useUserWithProfile } from '@/hooks/users/user.hook';
import { useActivityLogs } from '@/hooks/logs.hook';
import { Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function SchoolActivityLog() {
  const { user } = useAuth();
  const { data: userProfile } = useUserWithProfile(user?.sub || '');
  const schoolId = userProfile?.schoolAdminProfile?.school?.id || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);
  const { t } = useTranslation();

  const getParams = () => {
    const params: any = {
      schoolId,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchQuery || undefined,
    };

    const now = new Date();
    if (dateFilter === 'week') {
      params.startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      params.endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
    } else if (dateFilter === 'month') {
      params.startDate = startOfMonth(now).toISOString();
      params.endDate = endOfMonth(now).toISOString();
    } else if (dateFilter === 'custom' && customDateFrom && customDateTo) {
      params.startDate = customDateFrom.toISOString();
      params.endDate = customDateTo.toISOString();
    }

    return params;
  };

  const { data: logsData, isLoading } = useActivityLogs(getParams());
  const logs = logsData?.data || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = logsData?.totalPages || 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + logs.length;

  const handleDownload = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => 
        [
          log.timestamp,
          log.user,
          log.userRole,
          log.action,
          `"${log.details}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(t('school.activity.downloadSuccess'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            {t('school.activity.title')}
          </h2>
          <p className="text-muted-foreground">{t('school.activity.subtitle')}</p>
        </div>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t('school.activity.downloadCSV')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('common.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Date Filters */}
            <div className="space-y-4">
              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  setDateFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.allTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allTime')}</SelectItem>
                  <SelectItem value="week">{t('common.thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('common.thisMonth')}</SelectItem>
                  <SelectItem value="custom">{t('common.customRange')}</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">{t('common.fromDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateFrom ? format(customDateFrom, "PPP") : t('common.pickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateFrom}
                          onSelect={(date) => {
                            setCustomDateFrom(date);
                            setCurrentPage(1);
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('common.toDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateTo ? format(customDateTo, "PPP") : t('common.pickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateTo}
                          onSelect={(date) => {
                            setCustomDateTo(date);
                            setCurrentPage(1);
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('school.activity.activityHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-[180px]">{t('admin.activity.timestamp')}</TableHead>
                  <TableHead className="whitespace-nowrap w-[150px]">{t('admin.activity.user')}</TableHead>
                  <TableHead className="whitespace-nowrap w-[130px]">{t('admin.activity.role')}</TableHead>
                  <TableHead className="whitespace-nowrap w-[160px]">{t('admin.activity.action')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.activity.details')}</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="truncate">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate">{log.userName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{log.userRole}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate">{log.action}</div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate" title={log.details}>
                          {log.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('school.activity.noLogsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                {t('common.showing')} {startIndex + 1} {t('common.to')} {endIndex} {t('common.of')}{' '}
                {totalLogs} {t('common.entries')}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="min-w-[80px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">{t('common.previous')}</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="min-w-[80px]"
                >
                  <span className="mr-1">{t('common.next')}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
