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

export interface StackedAreaDataPoint {
  date: string;
  [key: string]: string | number;
}

interface AreaConfig {
  key: string;
  name: string;
  color: string;
  strokeDasharray?: string;
}

interface StackedAreaChartCardProps {
  title: string;
  subtitle: string;
  data: StackedAreaDataPoint[];
  areas: AreaConfig[];
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
  areas: AreaConfig[];
}

function CustomTooltip({ active, payload, label, showPercentage, areas }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    // Reverse to show from top (Other models) to bottom
    const reversedPayload = [...payload].reverse();
    
    // Map marker shapes to each area
    const markers = ['●', '◆', '▲', '●', '▼'];
    
    return (
      <div className="bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-dropdown dark:shadow-dark-dropdown p-3 min-w-[220px]">
        <p className="text-sm font-medium text-github-text dark:text-dark-text mb-2">
          {formatTooltipDate(label || '')}
        </p>
        <div className="space-y-1.5">
          {reversedPayload.map((entry, index) => {
            const areaConfig = areas.find(a => a.key === entry.dataKey);
            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm" 
                    style={{ color: entry.color }}
                  >
                    {markers[index % markers.length]}
                  </span>
                  <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">
                    {areaConfig?.name || entry.name}
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

export function StackedAreaChartCard({ 
  title, 
  subtitle, 
  data,
  areas,
  yAxisLabel = '',
  yAxisDomain,
  isLoading = false,
  showPercentage = false
}: StackedAreaChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#21262d' : '#e5e7eb';
  const axisColor = isDark ? '#8b949e' : '#9ca3af';
  const bgColor = isDark ? '#0d1117' : '#ffffff';

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
      
      {/* Legend with dashed/solid line indicators - matching GitHub style */}
      <div className="flex items-center gap-5 flex-wrap mb-4">
        {areas.map((area) => (
          <div key={area.key} className="flex items-center gap-2">
            <svg width="24" height="10" className="flex-shrink-0">
              <line 
                x1="0" y1="5" x2="24" y2="5" 
                stroke={area.color} 
                strokeWidth="2.5" 
                strokeDasharray={area.strokeDasharray ? "4 3" : undefined}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs text-github-textSecondary dark:text-dark-textSecondary">{area.name}</span>
          </div>
        ))}
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip showPercentage={showPercentage} areas={areas} />} />
            {areas.map((area, index) => (
              <Area 
                key={area.key}
                type="monotone" 
                dataKey={area.key}
                stackId="1"
                stroke={area.color} 
                strokeWidth={2}
                strokeDasharray={area.strokeDasharray}
                fill={area.color}
                fillOpacity={0.35 - (index * 0.03)}
                activeDot={{ 
                  r: 5, 
                  strokeWidth: 2, 
                  stroke: area.color,
                  fill: bgColor
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
