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
import { mockActivityLogs, ActivityLog } from '@/lib/mockData';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function AdminActivityLog() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);

  // Apply date filters
  const dateFilteredLogs = mockActivityLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const now = new Date();

    switch (dateFilter) {
      case 'week':
        return isWithinInterval(logDate, {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        });
      case 'month':
        return isWithinInterval(logDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
      case 'custom':
        if (customDateFrom && customDateTo) {
          return isWithinInterval(logDate, {
            start: customDateFrom,
            end: customDateTo
          });
        }
        return true;
      default:
        return true;
    }
  });

  // Apply search and filters
  const filteredLogs = dateFilteredLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || log.userRole === filterRole;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const getStatusColor = (status: ActivityLog['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    // Create CSV content
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

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Activity log exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Activity Log
          </h2>
          <p className="text-muted-foreground">
            Track all system-wide actions and changes across all schools
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-3 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions, details, or users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterRole}
                onValueChange={(value) => {
                  setFilterRole(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="School Admin">School Admin</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">From Date</Label>
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
                          {customDateFrom ? format(customDateFrom, "PPP") : "Pick a date"}
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
                    <Label className="text-sm">To Date</Label>
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
                          {customDateTo ? format(customDateTo, "PPP") : "Pick a date"}
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
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-[180px]">Timestamp</TableHead>
                  <TableHead className="whitespace-nowrap w-[150px]">User</TableHead>
                  <TableHead className="whitespace-nowrap w-[130px]">Role</TableHead>
                  <TableHead className="whitespace-nowrap w-[160px]">Action</TableHead>
                  <TableHead className="whitespace-nowrap">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="truncate">{log.timestamp}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate">{log.user}</div>
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
                      No activity logs found matching your filters
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of{' '}
                {filteredLogs.length} entries
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
                  <span className="ml-1">Prev</span>
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
                  <span className="mr-1">Next</span>
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
