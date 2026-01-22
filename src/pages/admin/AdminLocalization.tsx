import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Languages, Check, Plus } from 'lucide-react';

export default function AdminLocalization() {
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', native: 'English', progress: 100, enabled: true, default: true },
    { code: 'fr', name: 'French', native: 'Français', progress: 95, enabled: true, default: false },
    { code: 'ar', name: 'Arabic', native: 'العربية', progress: 85, enabled: true, default: false },
    { code: 'pt', name: 'Portuguese', native: 'Português', progress: 90, enabled: true, default: false },
    { code: 'es', name: 'Spanish', native: 'Español', progress: 0, enabled: false, default: false },
    { code: 'de', name: 'German', native: 'Deutsch', progress: 0, enabled: false, default: false },
  ];

  const currencies = [
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', default: true },
    { code: 'USD', symbol: '$', name: 'US Dollar', default: false },
    { code: 'EUR', symbol: '€', name: 'Euro', default: false },
    { code: 'GBP', symbol: '£', name: 'British Pound', default: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.localization')}</h1>
          <p className="text-muted-foreground">Language and regional settings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Active Languages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Languages className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">2,450</p>
            <p className="text-sm text-muted-foreground">Translation Keys</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Check className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-muted-foreground">Average Coverage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>Manage available languages for the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.map((lang) => (
            <div key={lang.code} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-medium text-primary uppercase">
                  {lang.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lang.name}</p>
                    <span className="text-muted-foreground">({lang.native})</span>
                    {lang.default && <Badge>Default</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${lang.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{lang.progress}% translated</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" disabled={lang.progress === 0}>
                  Edit Translations
                </Button>
                <Switch defaultChecked={lang.enabled} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Configure supported currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {currencies.map((currency) => (
              <div key={currency.code} className={`p-4 rounded-lg border ${currency.default ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{currency.symbol}</span>
                  {currency.default && <Badge>Default</Badge>}
                </div>
                <p className="font-medium">{currency.code}</p>
                <p className="text-sm text-muted-foreground">{currency.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date & Time Formats</CardTitle>
          <CardDescription>Regional formatting preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Date Format</p>
              <p className="font-medium">DD/MM/YYYY</p>
              <p className="text-xs text-muted-foreground mt-1">Example: 15/01/2024</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Time Format</p>
              <p className="font-medium">24-hour</p>
              <p className="text-xs text-muted-foreground mt-1">Example: 14:30</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">First Day of Week</p>
              <p className="font-medium">Monday</p>
              <p className="text-xs text-muted-foreground mt-1">Calendar starts on Monday</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
