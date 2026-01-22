import { cn } from '@/lib/utils';

type ColorVariant = 'blue' | 'green' | 'orange' | 'teal' | 'purple';

interface CircularProgressProps {
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  colorVariant?: ColorVariant;
  className?: string;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: 'stroke-stat-blue',
  green: 'stroke-stat-green',
  orange: 'stroke-stat-orange',
  teal: 'stroke-stat-teal',
  purple: 'stroke-stat-purple',
};

export function CircularProgress({
  value,
  label,
  sublabel = 'On track',
  size = 120,
  strokeWidth = 8,
  colorVariant = 'blue',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn('transition-all duration-500', colorClasses[colorVariant])}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}
