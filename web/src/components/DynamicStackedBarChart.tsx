import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface BarConfig {
  key: string;
  name: string;
  color: string;
}

interface DynamicStackedBarChartProps {
  title: string;
  subtitle: string;
  data: Array<{ [key: string]: string | number }>;
  xAxisKey: string;
  bars: BarConfig[];
  isLoading?: boolean;
  yAxisLabel?: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  bars: BarConfig[];
  xAxisKey: string;
}

function CustomTooltip({ active, payload, label, bars }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3 min-w-[180px]">
        <p className="text-sm font-medium text-github-text dark:text-dark-text mb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {[...payload].reverse().map((entry) => {
            const barConfig = bars.find(b => b.key === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">
                    {barConfig?.name || entry.dataKey}
                  </span>
                </div>
                <span className="text-xs font-medium text-github-text dark:text-dark-text">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
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

export function DynamicStackedBarChart({ 
  title, 
  subtitle, 
  data,
  xAxisKey,
  bars,
  isLoading = false,
  yAxisLabel
}: DynamicStackedBarChartProps) {
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
        {bars.map((bar) => (
          <div key={bar.key} className="flex items-center gap-1.5">
            <span 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: bar.color }}
            />
            <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">{bar.name}</span>
          </div>
        ))}
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
              vertical={false} 
            />
            <XAxis 
              dataKey={xAxisKey}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              dy={5}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              dx={-8}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: axisColor },
                offset: 0
              } : undefined}
            />
            <Tooltip content={<CustomTooltip bars={bars} xAxisKey={xAxisKey} />} cursor={{ fill: isDark ? 'rgba(56, 139, 253, 0.1)' : 'rgba(0,0,0,0.05)' }} />
            {bars.map((bar, index) => (
              <Bar 
                key={bar.key}
                dataKey={bar.key} 
                stackId="a" 
                fill={bar.color}
                radius={index === bars.length - 1 ? [2, 2, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
