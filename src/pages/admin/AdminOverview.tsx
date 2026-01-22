import { School, Users, Banknote, Clock } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { CircularProgress } from '@/components/CircularProgress';
import { mockSchools, mockPayments } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

export default function AdminOverview() {
  const { t } = useTranslation();
  
  const totalSchools = mockSchools.length;
  const activeSchools = mockSchools.filter((s) => s.status === 'Active').length;
  const totalStudents = mockSchools.reduce((sum, school) => sum + school.studentsCount, 0);
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const recentSchools = mockSchools.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">{t('admin.overview.title')}</h2>
        <p className="text-muted-foreground">{t('admin.overview.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('admin.overview.totalSchools')}
          value={totalSchools}
          icon={School}
          trend={{ value: `12% ${t('admin.overview.fromLastMonth')}`, isPositive: true }}
          colorVariant="blue"
        />
        <StatCard
          title={t('admin.overview.activeUsers')}
          value={totalStudents.toLocaleString()}
          icon={Users}
          trend={{ value: `8% ${t('admin.overview.fromLastMonth')}`, isPositive: true }}
          colorVariant="green"
        />
        <StatCard
          title={t('admin.overview.monthlyRevenue')}
          value={formatCurrency(totalRevenue)}
          icon={Banknote}
          trend={{ value: `15% ${t('admin.overview.fromLastMonth')}`, isPositive: true }}
          colorVariant="orange"
        />
        <StatCard
          title={t('admin.overview.pendingApprovals')}
          value={mockSchools.filter((s) => s.status === 'Pending').length}
          icon={Clock}
          colorVariant="teal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{t('admin.overview.recentSchools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {school.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{school.studentsCount} {t('common.students')}</p>
                    <p className={`text-xs ${school.status === 'Active' ? 'text-success' : 'text-warning'}`}>
                      {t(`common.${school.status.toLowerCase()}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{t('admin.overview.revenueByPlan')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Enterprise', 'Premium', 'Basic', 'Trial'].map((plan, index) => {
                const planSchools = mockSchools.filter((s) => s.plan === plan);
                const count = planSchools.length;
                const revenue = planSchools.reduce((sum, s) => sum + s.revenue, 0);
                const colors = ['bg-stat-purple', 'bg-stat-blue', 'bg-stat-green', 'bg-muted'];
                
                return (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${colors[index]}`} />
                      <span className="font-medium">{plan}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(revenue)}</p>
                      <p className="text-xs text-muted-foreground">{count} {t('common.schools')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{t('admin.overview.platformMetrics', 'Platform Metrics')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CircularProgress
              value={85}
              label={t('admin.overview.schoolGrowth', 'School Growth')}
              colorVariant="blue"
            />
            <CircularProgress
              value={92}
              label={t('admin.overview.revenueGoal', 'Revenue Goal')}
              colorVariant="green"
            />
            <CircularProgress
              value={78}
              label={t('admin.overview.userRetention', 'User Retention')}
              colorVariant="orange"
            />
            <CircularProgress
              value={96}
              label={t('admin.overview.uptime', 'Uptime')}
              colorVariant="teal"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
