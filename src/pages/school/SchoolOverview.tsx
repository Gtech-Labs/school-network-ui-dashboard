import { GraduationCap, UserCircle, Banknote, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { CircularProgress } from '@/components/CircularProgress';
import { QuickActions } from '@/components/QuickActions';
import { mockStudents, mockTeachers, mockStudentPayments } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function SchoolOverview() {
  const { t } = useTranslation();
  
  const totalStudents = mockStudents.length;
  const activeStudents = mockStudents.filter((s) => s.status === 'Active').length;
  const totalTeachers = mockTeachers.filter((t) => t.status === 'Active').length;
  const pendingPayments = mockStudentPayments.filter((p) => p.status === 'Pending' || p.status === 'Overdue').length;

  const recentStudents = mockStudents.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold">{t('school.overview.welcomeBack', 'Welcome back, Admin')}</h2>
        <p className="text-muted-foreground">{t('school.overview.subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('school.overview.totalStudents')}
          value={totalStudents}
          icon={GraduationCap}
          trend={{ value: `5% ${t('school.overview.fromLastTerm')}`, isPositive: true }}
          colorVariant="blue"
        />
        <StatCard
          title={t('school.overview.applications')}
          value={42}
          icon={UserCircle}
          trend={{ value: `8 ${t('school.overview.newThisWeek')}`, isPositive: true }}
          colorVariant="green"
        />
        <StatCard
          title={t('school.overview.pendingPayments')}
          value={pendingPayments}
          icon={Banknote}
          colorVariant="orange"
        />
        <StatCard
          title={t('school.overview.attendanceRate')}
          value="94%"
          icon={TrendingUp}
          trend={{ value: `2% ${t('school.overview.fromLastWeek')}`, isPositive: true }}
          colorVariant="teal"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{t('school.overview.recentStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{t('school.overview.fees')}: {student.feesPaid}%</p>
                    <p className={`text-xs ${student.status === 'Active' ? 'text-success' : 'text-muted-foreground'}`}>
                      {t(`common.${student.status.toLowerCase()}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{t('school.overview.classDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 11-A'].map((className, index) => {
                const classStudents = mockStudents.filter((s) => s.class === className).length;
                const percentage = (classStudents / totalStudents) * 100;
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
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
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
  );
}
