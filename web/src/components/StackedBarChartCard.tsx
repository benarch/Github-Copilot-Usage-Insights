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
import type { StackedChartDataPoint } from '@/types';

interface StackedBarChartCardProps {
  title: string;
  subtitle: string;
  data: StackedChartDataPoint[];
  isLoading?: boolean;
}

// Colors matching GitHub Copilot Insights - green scheme for chat mode requests
const COLORS = {
  edit: '#166534',     // Dark green
  ask: '#22c55e',      // Green
  agent: '#4ade80',    // Light green
  custom: '#86efac',   // Lighter green
  inline: '#bbf7d0',   // Very light green
};

const LABELS = {
  edit: 'Edit',
  ask: 'Ask',
  agent: 'Agent',
  custom: 'Custom',
  inline: 'Inline',
};

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
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3 min-w-[180px]">
        <p className="text-sm font-medium text-github-text dark:text-dark-text mb-2">
          {formatTooltipDate(label || '')}
        </p>
        <div className="space-y-1.5">
          {[...payload].reverse().map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">
                  {LABELS[entry.dataKey as keyof typeof LABELS]}
                </span>
              </div>
              <span className="text-xs font-medium text-github-text dark:text-dark-text">
                {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-github-borderLight dark:border-dark-border pt-1.5 mt-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-github-textSecondary dark:text-dark-textSecondary">Total</span>
            <span className="text-xs font-semibold text-github-text dark:text-dark-text">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-4 justify-start mb-4">
      {Object.entries(LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
          />
          <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function StackedBarChartCard({ 
  title, 
  subtitle, 
  data,
  isLoading = false
}: StackedBarChartCardProps) {
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
      
      <CustomLegend />
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              label={{ 
                value: 'Requests', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: axisColor },
                offset: 10
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(56, 139, 253, 0.1)' : 'rgba(0,0,0,0.05)' }} />
            <Bar dataKey="edit" stackId="a" fill={COLORS.edit} />
            <Bar dataKey="ask" stackId="a" fill={COLORS.ask} />
            <Bar dataKey="agent" stackId="a" fill={COLORS.agent} />
            <Bar dataKey="custom" stackId="a" fill={COLORS.custom} />
            <Bar dataKey="inline" stackId="a" fill={COLORS.inline} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
