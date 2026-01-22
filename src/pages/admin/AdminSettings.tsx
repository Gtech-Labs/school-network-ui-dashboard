import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building, Mail, Bell, Palette, Save } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.settings')}</h1>
          <p className="text-muted-foreground">Platform configuration and preferences</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Platform Information
              </CardTitle>
              <CardDescription>Basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="School Network" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@schoolnetwork.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input id="timezone" defaultValue="Africa/Johannesburg (GMT+2)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input id="currency" defaultValue="ZAR (R)" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'School Registration', description: 'Allow new schools to register', enabled: true },
                { title: 'Parent Portal', description: 'Enable parent access portal', enabled: true },
                { title: 'Mobile App', description: 'Enable mobile app access', enabled: false },
                { title: 'API Access', description: 'Allow third-party API access', enabled: true },
              ].map((feature) => (
                <div key={feature.title} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch defaultChecked={feature.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Customization
              </CardTitle>
              <CardDescription>Customize platform appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Click to upload logo</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Click to upload favicon</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary" />
                    <Input defaultValue="#0080FF" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg bg-secondary" />
                    <Input defaultValue="#0066CC" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg bg-accent" />
                    <Input defaultValue="#6699FF" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'New School Registration', description: 'When a new school signs up', enabled: true },
                { title: 'Payment Received', description: 'When a payment is processed', enabled: true },
                { title: 'Support Tickets', description: 'When a new support ticket is created', enabled: true },
                { title: 'System Alerts', description: 'Critical system notifications', enabled: true },
                { title: 'Weekly Reports', description: 'Weekly summary reports', enabled: false },
              ].map((notification) => (
                <div key={notification.title} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch defaultChecked={notification.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>SMTP and email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input id="smtp-user" placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password</Label>
                  <Input id="smtp-pass" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button variant="outline">Test Connection</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
