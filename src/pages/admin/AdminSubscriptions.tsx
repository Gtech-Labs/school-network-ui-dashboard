import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Check, X } from 'lucide-react';

export default function AdminSubscriptions() {
  const { t } = useTranslation();

  const plans = [
    { 
      name: 'Trial', 
      price: 'Free', 
      period: '14 days',
      schools: 1,
      features: ['Up to 50 students', 'Basic reports', 'Email support'],
      popular: false 
    },
    { 
      name: 'Basic', 
      price: 'R500', 
      period: '/month',
      schools: 2,
      features: ['Up to 200 students', 'Standard reports', 'Email & chat support', 'Parent portal'],
      popular: false 
    },
    { 
      name: 'Premium', 
      price: 'R1,500', 
      period: '/month',
      schools: 1,
      features: ['Up to 1000 students', 'Advanced analytics', 'Priority support', 'API access', 'Custom branding'],
      popular: true 
    },
    { 
      name: 'Enterprise', 
      price: 'R3,000', 
      period: '/month',
      schools: 1,
      features: ['Unlimited students', 'Full analytics suite', 'Dedicated support', 'Full API access', 'White-label option', 'SLA guarantee'],
      popular: false 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.subscriptions')}</h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.popular && <Badge>Popular</Badge>}
              </div>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{plan.schools} {plan.schools === 1 ? 'school' : 'schools'} on this plan</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">Edit Plan</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Statistics</CardTitle>
          <CardDescription>Overview of active subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Total Schools</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">R48,800</p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">92%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Pending Trials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
