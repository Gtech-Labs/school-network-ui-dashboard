import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Plus, Users, Shield, Settings } from 'lucide-react';

export default function AdminPermissions() {
  const { t } = useTranslation();

  const roles = [
    { 
      name: 'Super Admin', 
      description: 'Full access to all features', 
      users: 2,
      color: 'bg-destructive'
    },
    { 
      name: 'Platform Admin', 
      description: 'Manage schools and billing', 
      users: 5,
      color: 'bg-primary'
    },
    { 
      name: 'School Admin', 
      description: 'Manage single school', 
      users: 15,
      color: 'bg-success'
    },
    { 
      name: 'Support Staff', 
      description: 'View-only access for support', 
      users: 8,
      color: 'bg-warning'
    },
  ];

  const permissions = [
    { category: 'Schools', items: ['View schools', 'Create schools', 'Edit schools', 'Delete schools'] },
    { category: 'Users', items: ['View users', 'Create users', 'Edit users', 'Delete users'] },
    { category: 'Billing', items: ['View invoices', 'Create invoices', 'Process payments', 'Manage refunds'] },
    { category: 'Settings', items: ['View settings', 'Edit settings', 'Manage integrations', 'System configuration'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.permissions')}</h1>
          <p className="text-muted-foreground">Manage roles and access control</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg ${role.color} flex items-center justify-center`}>
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <h3 className="font-semibold">{role.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{role.users} users</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Configure permissions for Platform Admin role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {permissions.map((group) => (
              <div key={group.category} className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  {group.category}
                </h4>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox id={item} defaultChecked={!item.includes('Delete')} />
                      <label htmlFor={item} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button>Save Changes</Button>
            <Button variant="outline">Reset to Default</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
