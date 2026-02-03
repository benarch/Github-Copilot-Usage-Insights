import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps,
  Legend as _Legend
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export interface MultiLineDataPoint {
  date: string;
  [key: string]: string | number;
}

interface LineConfig {
  key: string;
  name: string;
  color: string;
  strokeDasharray?: string;
}

interface MultiLineChartCardProps {
  title: string;
  subtitle: string;
  data: MultiLineDataPoint[];
  lines: LineConfig[];
  yAxisLabel?: string;
  yAxisDomain?: [number | string, number | string];
  isLoading?: boolean;
  showPercentage?: boolean;
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
  showPercentage?: boolean;
  lines: LineConfig[];
}

function CustomTooltip({ active, payload, label, showPercentage, lines }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3 min-w-[200px]">
        <p className="text-sm font-medium text-github-text dark:text-dark-text mb-2">
          {formatTooltipDate(label || '')}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry) => {
            const lineConfig = lines.find(l => l.key === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">
                    {lineConfig?.name || entry.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-github-text dark:text-dark-text">
                  {typeof entry.value === 'number' 
                    ? (showPercentage ? `${entry.value.toFixed(2)}%` : entry.value.toLocaleString())
                    : entry.value
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export function MultiLineChartCard({ 
  title, 
  subtitle, 
  data,
  lines,
  yAxisLabel = '',
  yAxisDomain,
  isLoading = false,
  showPercentage = false
}: MultiLineChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#21262d' : '#e5e7eb';
  const axisColor = isDark ? '#8b949e' : '#9ca3af';

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
      
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-1.5">
            <span 
              className="w-4 h-0.5 rounded" 
              style={{ 
                backgroundColor: line.color,
                borderStyle: line.strokeDasharray ? 'dashed' : 'solid',
              }}
            />
            <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">{line.name}</span>
          </div>
        ))}
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((line) => (
                <linearGradient key={`gradient-${line.key}`} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                </linearGradient>
              ))}
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
              domain={yAxisDomain}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              dx={-8}
              tickFormatter={(value) => showPercentage ? `${value}` : (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: axisColor },
                offset: 10
              } : undefined}
            />
            <Tooltip content={<CustomTooltip showPercentage={showPercentage} lines={lines} />} />
            {lines.map((line) => (
              <Area 
                key={line.key}
                type="monotone" 
                dataKey={line.key} 
                stroke={line.color} 
                strokeWidth={2}
                strokeDasharray={line.strokeDasharray}
                fill={`url(#gradient-${line.key})`}
                fillOpacity={0.3}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0d1117' : '#ffffff' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
