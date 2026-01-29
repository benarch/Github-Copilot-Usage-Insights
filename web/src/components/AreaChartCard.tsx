import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import type { ChartDataPoint } from '@/types';

interface AreaChartCardProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  color?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTooltipDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  label?: string;
  chartTitle: string;
}

function CustomTooltip({ active, payload, label, chartTitle }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-github-border rounded-lg shadow-dropdown p-3">
        <p className="text-sm font-medium text-github-text mb-1">
          {formatTooltipDate(label || '')}
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-600" />
          <span className="text-sm text-github-textSecondary">{chartTitle}</span>
          <span className="text-sm font-semibold text-github-text">
            {payload[0].value?.toLocaleString()} {payload[0].value === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function AreaChartCard({ 
  title, 
  subtitle, 
  data, 
  color = '#2563eb',
  yAxisLabel = 'Users',
  isLoading = false
}: AreaChartCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-github-border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-github-border rounded-lg p-4 hover:shadow-cardHover transition-shadow">
      <h3 className="text-base font-semibold text-github-text mb-1">{title}</h3>
      <p className="text-xs text-github-textSecondary mb-4">{subtitle}</p>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false} 
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              dy={8}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              dx={-8}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#9ca3af' },
                offset: 10
              }}
            />
            <Tooltip 
              content={<CustomTooltip chartTitle={title} />}
              cursor={{ stroke: '#d0d7de', strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title.replace(/\s/g, '')})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
