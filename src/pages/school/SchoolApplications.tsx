import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApplications } from '@/hooks/users/application.hook';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchoolId } from '@/hooks/schools/school.hook';

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  'SUBMITTED': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'UNDER-REVIEW': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'WAITING-LIST-A': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'WAITING-LIST-B': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'PROVISIONALLY-ACCEPTED': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'ACCEPTED': 'bg-green-500/10 text-green-500 border-green-500/20',
  'PARENT-ACCEPTED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'REGISTERED': 'bg-primary/10 text-primary border-primary/20',
  'REJECTED': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  'SUBMITTED': 'Submitted',
  'UNDER-REVIEW': 'Under Review',
  'WAITING-LIST-A': 'Waiting List A',
  'WAITING-LIST-B': 'Waiting List B',
  'PROVISIONALLY-ACCEPTED': 'Provisionally Accepted',
  'ACCEPTED': 'Accepted',
  'PARENT-ACCEPTED': 'Parent Accepted Offer',
  'REGISTERED': 'Registered',
  'REJECTED': 'Rejected',
};

export default function SchoolApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const schoolId = useSchoolId(user?.sub);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Query for stats (all school applications)
  const { data: allApplications = [] } = useApplications({ 
    schoolId: schoolId || undefined 
  }, { enabled: !!schoolId });

  // Query for filtered table
  const { data: filteredApplications = [], isLoading } = useApplications({
    schoolId: schoolId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
    dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
  }, { enabled: !!schoolId });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleApplicationClick = (id: string) => {
    navigate(`/school/applications/${id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Applications</h2>
          <p className="text-muted-foreground">Manage student admission applications</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allApplications.filter((a: any) => a.status === 'UNDER-REVIEW').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allApplications.filter((a: any) => a.status === 'ACCEPTED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allApplications.filter((a: any) => a.status === 'REGISTERED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name, parent, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER-REVIEW">Under Review</SelectItem>
                  <SelectItem value="WAITING-LIST-A">Waiting List A</SelectItem>
                  <SelectItem value="WAITING-LIST-B">Waiting List B</SelectItem>
                  <SelectItem value="PROVISIONALLY-ACCEPTED">Provisionally Accepted</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="PARENT-ACCEPTED">Parent Accepted Offer</SelectItem>
                  <SelectItem value="REGISTERED">Registered</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  setDateFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : currentApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentApplications.map((application: any) => (
                    <TableRow
                      key={application.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleApplicationClick(application.id)}
                    >
                      <TableCell className="font-medium">{application.student?.fullName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{application.parent?.fullName}</span>
                          <span className="text-xs text-muted-foreground">{application.parent?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{application.student?.grade}</TableCell>
                      <TableCell>{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[application.status]}>
                          {statusLabels[application.status] || application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplicationClick(application.id);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredApplications.length)} of{' '}
                {filteredApplications.length} applications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
