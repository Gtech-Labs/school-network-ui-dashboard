import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GraduationCap, UserCircle, Banknote, TrendingUp, Users} from 'lucide-react';
import {StatCard} from '@/components/StatCard';
import {CircularProgress} from '@/components/CircularProgress';
import {QuickActions} from '@/components/QuickActions';
import {GenerateReportDialog} from '@/components/GenerateReportDialog';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useTeachers} from '@/hooks/users/teacher.hook';

import {useTranslation} from 'react-i18next';
import {useApiQuery} from "@/hooks/use-api-query.ts";
import {useAuth} from "@/context/AuthContext.tsx";
import {useSchoolId} from "@/hooks/schools/school.hook.ts";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceTotals } from "@/hooks/finance.hook";
import { formatCurrency } from "@/lib/currency";


export default function SchoolOverview() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [reportOpen, setReportOpen] = useState(false);
    const {user} = useAuth();
    const schoolId = useSchoolId(user?.sub);

    // Get students per school
    const {data: studentsResponse, isLoading, isError} = useApiQuery(
        ['students', schoolId],
        `/students/profiles-per-school?schoolId=${schoolId}`,
        {
            enabled: !!schoolId,
        }
    );

    // Get applications per school
    const {data: schoolApplicationsResponse, isLoading: applicationsLoading, isError: applicationsError} = useApiQuery(
        ['schoolApplications', schoolId],
        `/applications?schoolId=${schoolId}`,
        {
            enabled: !!schoolId,
        }
    );

    // Get teachers per school
    const {data: teachersResponse, isLoading: teachersLoading} = useTeachers(schoolId);


    const totalStudents = studentsResponse?.count ?? studentsResponse?.data?.length ?? 0;
    const totalApplications = schoolApplicationsResponse?.count ?? schoolApplicationsResponse?.data?.length ?? 0;
    const studentsList: any[] = studentsResponse?.data || [];
    const recentStudents = studentsList.slice(0, 5);

    const teachersList: any[] = teachersResponse?.data || [];
    const totalTeachersCount = teachersResponse?.count ?? teachersList.length ?? 0;
    
    const { data: totalsData, isLoading: totalsLoading } = useInvoiceTotals({ schoolId: schoolId || '' });
    const feesPaid = totalsData?.totalPaid || 0;
    const feesOutstanding = totalsData?.totalUnpaid || 0;
    const totalFees = totalsData?.totalRevenue || 0;


    return (
        <>
            {!schoolId ? <div>Contact your Admin — no school assigned to this user</div> :
                <div className="space-y-6 animate-fade-in">
                    {/* Welcome, Header */}
                    <div>
                        <h2 className="text-3xl font-bold">{t('school.overview.welcomeBack', 'Welcome back, Admin')}</h2>
                        <p className="text-muted-foreground">{t('school.overview.subtitle')}</p>
                    </div>

                    {/* Quick Actions */}
                    <QuickActions
                        onAddStudent={() => navigate('/school/students')}
                        onSendMessage={() => navigate('/school/announcements')}
                        onGenerateReport={() => setReportOpen(true)}
                        onScheduleEvent={() => navigate('/school/calendar')}
                    />
                    <GenerateReportDialog open={reportOpen} onOpenChange={setReportOpen}/>

                    {/* Stat Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title={t('school.overview.totalStudents')}
                            value={isLoading ? <Skeleton className="h-8 w-16" /> : totalStudents}
                            icon={GraduationCap}
                            trend={{value: `5% ${t('school.overview.fromLastTerm')}`, isPositive: true}}
                            colorVariant="blue"
                        />
                        <StatCard
                            title={t('school.overview.applications')}
                            value={applicationsLoading ? <Skeleton className="h-8 w-16" /> : totalApplications}
                            icon={UserCircle}
                            trend={{value: `8 ${t('school.overview.newThisWeek')}`, isPositive: true}}
                            colorVariant="green"
                        />
                        <StatCard
                            title={t('school.payments.pending')}
                            value={totalsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(feesOutstanding)}
                            icon={Banknote}
                            colorVariant="orange"
                        />
                        <StatCard
                            title={t('school.overview.totalTeachers', 'Total Teachers')}
                            value={teachersLoading ? <Skeleton className="h-8 w-16" /> : totalTeachersCount}
                            icon={Users}
                            colorVariant="teal"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Students */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>{t('school.overview.recentStudents')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-10 w-10 rounded-full" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : isError ? (
                                        <div className="text-center py-4 text-destructive">Failed to fetch students</div>
                                    ) : recentStudents.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground">No recent students found</div>
                                    ) : (
                                        recentStudents.map((student: any) => (
                                            <div
                                                key={student?.id}
                                                className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-accent/30 rounded px-2 transition-colors"
                                                onClick={() => navigate(`/school/students/${student?.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {(student?.fullName || student?.preferredName || 'S')
                                                                .split(' ')
                                                                .map((n: string) => n[0])
                                                                .join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{student?.fullName || student?.preferredName}</p>
                                                        <p className="text-sm text-muted-foreground">{student?.grade}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{t('school.overview.fees')}: {student?.feesPaid ?? 0}%</p>
                                                    <p className={`text-xs ${(student?.status ?? 'Active') === 'Active' ? 'text-success' : 'text-muted-foreground'}`}>
                                                        {t(`common.${(student?.status ?? 'Active').toLowerCase()}`)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class Distribution */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>{t('school.overview.classDistribution')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(() => {
                                        const classes = [...new Set(studentsList.map(s => s.grade || s.classSection || 'Unassigned'))].slice(0, 4);
                                        return classes.map((className, index) => {
                                            const classStudents = studentsList.filter((s) => (s.grade || s.classSection || 'Unassigned') === className).length;
                                            const percentage = totalStudents > 0 ? (classStudents / totalStudents) * 100 : 0;
                                            const colors = ['bg-stat-blue', 'bg-stat-green', 'bg-stat-orange', 'bg-stat-teal'];

                                            return (
                                                <div key={className} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">{className}</span>
                                                        <span className="text-muted-foreground">{classStudents} {t('common.students')}</span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full ${colors[index % colors.length]} transition-all`}
                                                            style={{width: `${percentage}%`}}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Circular Progress Section */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>{t('school.overview.performanceMetrics', 'Performance Metrics')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <CircularProgress
                                    value={78}
                                    label={t('school.overview.enrollmentGoal', 'Enrollment Goal')}
                                    colorVariant="blue"
                                />
                                <CircularProgress
                                    value={92}
                                    label={t('school.overview.revenueTarget', 'Revenue Target')}
                                    colorVariant="green"
                                />
                                <CircularProgress
                                    value={94}
                                    label={t('school.overview.attendanceRate')}
                                    colorVariant="teal"
                                />
                                <CircularProgress
                                    value={88}
                                    label={t('school.overview.satisfaction', 'Satisfaction')}
                                    colorVariant="purple"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
        </>
    );
}
