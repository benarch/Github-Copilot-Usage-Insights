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
import { useTheme } from '@/contexts/ThemeContext';
import type { ChartDataPoint } from '@/types';

interface AreaChartCardProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  color?: string;
  darkColor?: string;
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
  lineColor: string;
}

function CustomTooltip({ active, payload, label, chartTitle, lineColor }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3">
        <p className="text-sm font-medium text-github-text dark:text-dark-text mb-1">
          {formatTooltipDate(label || '')}
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColor }} />
          <span className="text-sm text-github-textSecondary dark:text-dark-textSecondary">{chartTitle}</span>
          <span className="text-sm font-semibold text-github-text dark:text-dark-text">
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
  darkColor = '#58a6ff',
  yAxisLabel = 'Users',
  isLoading = false
}: AreaChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use appropriate colors based on theme
  const lineColor = isDark ? darkColor : color;
  const gridColor = isDark ? '#21262d' : '#e5e7eb';
  const axisColor = isDark ? '#8b949e' : '#9ca3af';
  const cursorColor = isDark ? '#30363d' : '#d0d7de';

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-dark-bgTertiary rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-dark-bgTertiary rounded w-2/3 mb-4" />
          <div className="h-64 bg-gray-100 dark:bg-dark-bgTertiary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg p-4 hover:shadow-cardHover dark:hover:shadow-dark-card transition-shadow">
      <h3 className="text-base font-semibold text-github-text dark:text-dark-text mb-1">{title}</h3>
      <p className="text-xs text-github-textSecondary dark:text-dark-textSecondary mb-4">{subtitle}</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
              vertical={false} 
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              dy={8}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              dx={-8}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: axisColor },
                offset: 10
              }}
            />
            <Tooltip 
              content={<CustomTooltip chartTitle={title} lineColor={lineColor} />}
              cursor={{ stroke: cursorColor, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#gradient-${title.replace(/\s/g, '')})`}
              dot={false}
              activeDot={{ r: 5, fill: lineColor, stroke: isDark ? '#0d1117' : '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
