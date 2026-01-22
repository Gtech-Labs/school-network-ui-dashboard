import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';

export default function AdminRevenue() {
  const { t } = useTranslation();

  const revenueStats = [
    { label: 'Total Revenue (YTD)', value: 'R584,500', change: '+18%', trend: 'up', icon: Wallet },
    { label: 'Monthly Recurring', value: 'R48,800', change: '+12%', trend: 'up', icon: DollarSign },
    { label: 'Average Per School', value: 'R9,760', change: '+5%', trend: 'up', icon: TrendingUp },
    { label: 'Churn Rate', value: '2.1%', change: '-0.5%', trend: 'down', icon: TrendingDown },
  ];

  const transactions = [
    { id: 'TXN001', school: 'Greenwood High', amount: 'R12,500', date: '2024-01-15', status: 'Completed' },
    { id: 'TXN002', school: 'Riverside Academy', amount: 'R8,400', date: '2024-01-14', status: 'Completed' },
    { id: 'TXN003', school: 'Oakmont International', amount: 'R25,000', date: '2024-01-12', status: 'Completed' },
    { id: 'TXN004', school: 'Sunset Valley', amount: 'R3,000', date: '2024-01-10', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.revenue')}</h1>
          <p className="text-muted-foreground">Financial overview and revenue tracking</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {revenueStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stat.change} from last period
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Revenue trend visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Distribution across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Plan distribution</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{txn.school}</p>
                    <p className="text-sm text-muted-foreground">{txn.id} • {txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{txn.amount}</p>
                  <p className={`text-xs ${txn.status === 'Completed' ? 'text-success' : 'text-warning'}`}>
                    {txn.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
