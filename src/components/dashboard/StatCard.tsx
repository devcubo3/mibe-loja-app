import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-body text-text-secondary mb-xs">{title}</p>
            <h3 className="text-title font-bold mb-xs">{value}</h3>
            {subtitle && (
              <p className="text-caption text-text-muted">{subtitle}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>

        {trend && (
          <div className="mt-md pt-md border-t border-divider">
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error" />
              )}
              <span
                className={`text-caption font-medium ${
                  trend.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-caption text-text-muted">vs ontem</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
