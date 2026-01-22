import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, Activity, Download, RefreshCw, Table } from 'lucide-react';

export default function AdminDatabase() {
  const { t } = useTranslation();

  const tables = [
    { name: 'schools', rows: '5', size: '2.4 MB', lastUpdated: '2 mins ago' },
    { name: 'users', rows: '2,970', size: '45.2 MB', lastUpdated: '5 mins ago' },
    { name: 'students', rows: '15,420', size: '128.5 MB', lastUpdated: '1 min ago' },
    { name: 'payments', rows: '8,234', size: '32.1 MB', lastUpdated: '10 mins ago' },
    { name: 'invoices', rows: '12,456', size: '54.8 MB', lastUpdated: '15 mins ago' },
    { name: 'activity_logs', rows: '145,678', size: '256.3 MB', lastUpdated: 'Just now' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.database')}</h1>
          <p className="text-muted-foreground">Database management and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">6</p>
            <p className="text-sm text-muted-foreground">Tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Table className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">184,763</p>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <HardDrive className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">519.3 MB</p>
            <p className="text-sm text-muted-foreground">Storage Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">23ms</p>
            <p className="text-sm text-muted-foreground">Avg Query Time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Overview of all database tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tables.map((table) => (
              <div key={table.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Table className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium font-mono">{table.name}</p>
                    <p className="text-sm text-muted-foreground">{table.rows} rows • {table.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{table.lastUpdated}</span>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Backups</CardTitle>
            <CardDescription>Automatic daily backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: '2024-01-15 02:00 AM', size: '518.2 MB', status: 'completed' },
              { date: '2024-01-14 02:00 AM', size: '516.8 MB', status: 'completed' },
              { date: '2024-01-13 02:00 AM', size: '514.3 MB', status: 'completed' },
            ].map((backup, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{backup.date}</p>
                  <p className="text-sm text-muted-foreground">{backup.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Completed</Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Performance</CardTitle>
            <CardDescription>Monitor slow queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Query performance chart placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
