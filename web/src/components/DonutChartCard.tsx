import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  TooltipProps
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export interface DonutChartDataPoint {
  name: string;
  value: number;
  percentage: number;
}

interface DonutChartCardProps {
  title: string;
  subtitle: string;
  data: DonutChartDataPoint[];
  isLoading?: boolean;
  colors?: string[];
}

// Default colors matching GitHub Copilot Insights theme
const DEFAULT_COLORS = [
  '#0969da', // Primary blue (Claude Sonnet 4.5)
  '#1f6feb', // Lighter blue (Claude Opus 4.5)
  '#54aeff', // Light blue (GPT-5.2)
  '#79c0ff', // Lighter blue (GPT-4.1)
  '#a5d6ff', // Very light blue (Other models)
];

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const data = entry.payload as DonutChartDataPoint;
    
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3 min-w-[140px]">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-github-text dark:text-dark-text">
            {data.name}
          </span>
        </div>
        <p className="text-lg font-semibold text-github-text dark:text-dark-text">
          {data.percentage.toFixed(1)}%
        </p>
        <p className="text-xs text-github-textSecondary dark:text-dark-textSecondary">
          {data.value.toLocaleString()} requests
        </p>
      </div>
    );
  }
  return null;
}

export function DonutChartCard({ 
  title, 
  subtitle, 
  data,
  isLoading = false,
  colors = DEFAULT_COLORS
}: DonutChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      
      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="h-64 w-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke={isDark ? '#0d1117' : '#ffffff'}
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-3">
              <span 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-github-text dark:text-dark-text min-w-[120px]">
                {entry.name}
              </span>
              <span className="text-sm font-medium text-github-text dark:text-dark-text">
                {entry.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
