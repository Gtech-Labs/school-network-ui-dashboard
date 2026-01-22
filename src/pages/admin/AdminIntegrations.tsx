import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, CreditCard, Mail, MessageSquare, Cloud, Database, Calendar, FileText } from 'lucide-react';

export default function AdminIntegrations() {
  const { t } = useTranslation();

  const integrations = [
    { 
      name: 'Stripe', 
      description: 'Payment processing', 
      icon: CreditCard,
      status: 'connected',
      category: 'Payments'
    },
    { 
      name: 'SendGrid', 
      description: 'Email delivery service', 
      icon: Mail,
      status: 'connected',
      category: 'Communication'
    },
    { 
      name: 'Twilio', 
      description: 'SMS notifications', 
      icon: MessageSquare,
      status: 'disconnected',
      category: 'Communication'
    },
    { 
      name: 'AWS S3', 
      description: 'File storage', 
      icon: Cloud,
      status: 'connected',
      category: 'Storage'
    },
    { 
      name: 'Google Calendar', 
      description: 'Calendar sync', 
      icon: Calendar,
      status: 'disconnected',
      category: 'Productivity'
    },
    { 
      name: 'Google Drive', 
      description: 'Document storage', 
      icon: FileText,
      status: 'disconnected',
      category: 'Storage'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.integrations')}</h1>
          <p className="text-muted-foreground">Connect third-party services</p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Browse Integrations
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Active Integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">12.4GB</p>
            <p className="text-sm text-muted-foreground">Data Synced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Cloud className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">99.9%</p>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <integration.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                  {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                </Badge>
                <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Manage API keys for custom integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Production API Key</p>
              <p className="text-sm text-muted-foreground font-mono">sk_live_•••••••••••••••••••••••••</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reveal</Button>
              <Button variant="outline" size="sm">Regenerate</Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Test API Key</p>
              <p className="text-sm text-muted-foreground font-mono">sk_test_•••••••••••••••••••••••••</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Reveal</Button>
              <Button variant="outline" size="sm">Regenerate</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
