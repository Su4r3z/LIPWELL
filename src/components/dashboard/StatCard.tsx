import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorClass?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  colorClass = "text-teal dark:text-mint"
}: StatCardProps) {
  return (
    <Card glass className="p-5 flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm tracking-wide">{title}</h3>
        {icon && <div className={`p-2 rounded-xl bg-white dark:bg-white/5 opacity-80 shadow-sm ${colorClass}`}>{icon}</div>}
      </div>
      
      <div>
        <div className="flex items-end gap-3">
          <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
          
          {trend && trendValue && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-1 ${
              trend === 'up' ? 'bg-salmon/10 text-salmon' : 
              trend === 'down' ? 'bg-mint/20 text-teal dark:text-mint' : 
              'bg-gray-100 dark:bg-white/10 text-gray-400'
            }`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">{subtitle}</p>}
      </div>
    </Card>
  );
}
