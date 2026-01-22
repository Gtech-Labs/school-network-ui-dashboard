import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ColorVariant = 'blue' | 'green' | 'orange' | 'teal' | 'purple';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  colorVariant?: ColorVariant;
}

const colorClasses: Record<ColorVariant, { bg: string; icon: string }> = {
  blue: {
    bg: 'bg-stat-blue-bg',
    icon: 'text-stat-blue',
  },
  green: {
    bg: 'bg-stat-green-bg',
    icon: 'text-stat-green',
  },
  orange: {
    bg: 'bg-stat-orange-bg',
    icon: 'text-stat-orange',
  },
  teal: {
    bg: 'bg-stat-teal-bg',
    icon: 'text-stat-teal',
  },
  purple: {
    bg: 'bg-stat-purple-bg',
    icon: 'text-stat-purple',
  },
};

export function StatCard({ title, value, icon: Icon, trend, className, colorVariant = 'blue' }: StatCardProps) {
  const colors = colorClasses[colorVariant];
  
  return (
    <Card className={cn('relative overflow-hidden border-border/50', className)}>
      <CardContent className="p-6">
        {trend && (
          <div className={cn(
            'absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium',
            trend.isPositive 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value.split(' ')[0]}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className={cn('rounded-xl p-3', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.icon)} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
