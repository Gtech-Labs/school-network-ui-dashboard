import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Edit, Copy, Eye, Send } from 'lucide-react';

export default function AdminEmailTemplates() {
  const { t } = useTranslation();

  const templates = [
    { 
      id: 1, 
      name: 'Welcome Email', 
      subject: 'Welcome to School Network!', 
      category: 'Onboarding',
      lastUpdated: '2 days ago',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Invoice Generated', 
      subject: 'Your invoice is ready', 
      category: 'Billing',
      lastUpdated: '1 week ago',
      status: 'active'
    },
    { 
      id: 3, 
      name: 'Payment Reminder', 
      subject: 'Payment reminder for your subscription', 
      category: 'Billing',
      lastUpdated: '3 days ago',
      status: 'active'
    },
    { 
      id: 4, 
      name: 'Password Reset', 
      subject: 'Reset your password', 
      category: 'Authentication',
      lastUpdated: '1 month ago',
      status: 'active'
    },
    { 
      id: 5, 
      name: 'Account Suspended', 
      subject: 'Your account has been suspended', 
      category: 'Account',
      lastUpdated: '2 weeks ago',
      status: 'draft'
    },
  ];

  const categories = ['All', 'Onboarding', 'Billing', 'Authentication', 'Account', 'Notifications'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.emailTemplates')}</h1>
          <p className="text-muted-foreground">Manage email templates for automated communications</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{templates.length}</p>
            <p className="text-sm text-muted-foreground">Total Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">12,456</p>
            <p className="text-sm text-muted-foreground">Emails Sent (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">68%</p>
            <p className="text-sm text-muted-foreground">Open Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Edit className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">1</p>
            <p className="text-sm text-muted-foreground">Draft Templates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email communication templates</CardDescription>
            </div>
            <div className="flex gap-2">
              {categories.slice(0, 4).map((cat) => (
                <Button 
                  key={cat} 
                  variant={cat === 'All' ? 'default' : 'outline'} 
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{template.name}</p>
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last updated {template.lastUpdated}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Variables</CardTitle>
          <CardDescription>Available variables for email templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[
              { var: '{{school_name}}', desc: 'School name' },
              { var: '{{user_name}}', desc: 'User full name' },
              { var: '{{user_email}}', desc: 'User email address' },
              { var: '{{invoice_amount}}', desc: 'Invoice total amount' },
              { var: '{{due_date}}', desc: 'Payment due date' },
              { var: '{{reset_link}}', desc: 'Password reset URL' },
              { var: '{{current_date}}', desc: 'Current date' },
              { var: '{{support_email}}', desc: 'Support email' },
            ].map((item) => (
              <div key={item.var} className="p-3 bg-muted/30 rounded-lg">
                <code className="text-sm font-mono text-primary">{item.var}</code>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
