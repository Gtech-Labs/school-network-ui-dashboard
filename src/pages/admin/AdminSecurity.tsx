import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Eye, UserX } from 'lucide-react';

export default function AdminSecurity() {
  const { t } = useTranslation();

  const securitySettings = [
    { 
      title: 'Two-Factor Authentication', 
      description: 'Require 2FA for all admin accounts', 
      enabled: true,
      icon: Key
    },
    { 
      title: 'Session Timeout', 
      description: 'Auto-logout after 30 minutes of inactivity', 
      enabled: true,
      icon: Lock
    },
    { 
      title: 'IP Whitelist', 
      description: 'Restrict access to approved IP addresses', 
      enabled: false,
      icon: Shield
    },
    { 
      title: 'Login Notifications', 
      description: 'Email alerts for new device logins', 
      enabled: true,
      icon: Eye
    },
  ];

  const recentActivity = [
    { action: 'Successful login', user: 'admin@school.com', ip: '192.168.1.1', time: '2 mins ago', status: 'success' },
    { action: 'Password changed', user: 'user@greenwood.edu', ip: '192.168.1.45', time: '1 hour ago', status: 'success' },
    { action: 'Failed login attempt', user: 'unknown@email.com', ip: '45.33.32.156', time: '3 hours ago', status: 'warning' },
    { action: 'New device login', user: 'admin@riverside.edu', ip: '192.168.2.10', time: '5 hours ago', status: 'info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.security')}</h1>
          <p className="text-muted-foreground">Platform security settings and monitoring</p>
        </div>
        <Button variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Security Audit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">98%</p>
            <p className="text-sm text-muted-foreground">Security Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Active Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <UserX className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Blocked IPs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure platform security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securitySettings.map((setting) => (
              <div key={setting.title} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <setting.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Monitor authentication activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'success' ? 'bg-success' : 
                    activity.status === 'warning' ? 'bg-warning' : 'bg-info'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.ip}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
