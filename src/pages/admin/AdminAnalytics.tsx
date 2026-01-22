import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, School, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalytics() {
  const { t } = useTranslation();

  const metrics = [
    { label: 'Total Page Views', value: '1.2M', change: '+12%', icon: BarChart3, color: 'text-primary' },
    { label: 'Active Sessions', value: '3,421', change: '+8%', icon: Activity, color: 'text-success' },
    { label: 'New Registrations', value: '847', change: '+23%', icon: Users, color: 'text-info' },
    { label: 'Conversion Rate', value: '4.8%', change: '+2.1%', icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('nav.analytics')}</h1>
        <p className="text-muted-foreground">Platform analytics and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <p className="text-xs text-success mt-1">{metric.change} from last month</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Monthly visitor trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Connect analytics to view data</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Session duration and bounce rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Connect analytics to view data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
