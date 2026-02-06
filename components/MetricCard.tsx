import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  color = "text-gray-900"
}) => {
  const trendColor = 
    trend === 'positive' ? 'text-emerald-600' : 
    trend === 'negative' ? 'text-red-600' : 
    'text-gray-500';

  const iconBg = 
    trend === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
    trend === 'negative' ? 'bg-red-100 text-red-600' : 
    'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between hover:border-blue-300 transition-colors shadow-sm">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
        {subValue && (
          <p className={`text-sm mt-1 font-medium ${trendColor}`}>
            {subValue}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};