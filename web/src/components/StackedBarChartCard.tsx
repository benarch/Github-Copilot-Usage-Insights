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
import type { StackedChartDataPoint } from '@/types';

interface StackedBarChartCardProps {
  title: string;
  subtitle: string;
  data: StackedChartDataPoint[];
  isLoading?: boolean;
}

const COLORS = {
  edit: '#1f2937',    // Dark gray
  ask: '#22c55e',     // Green
  agent: '#16a34a',   // Darker green
  custom: '#f97316',  // Orange
  inline: '#06b6d4',  // Cyan
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
      <div className="bg-white border border-github-border rounded-lg shadow-dropdown p-3">
        <p className="text-sm font-medium text-github-text mb-2">
          {formatTooltipDate(label || '')}
        </p>
        <div className="space-y-1">
          {payload.reverse().map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-github-textSecondary">
                  {LABELS[entry.dataKey as keyof typeof LABELS]}
                </span>
              </div>
              <span className="text-xs font-medium text-github-text">
                {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-github-borderLight pt-1 mt-1 flex items-center justify-between">
            <span className="text-xs font-medium text-github-textSecondary">Total</span>
            <span className="text-xs font-semibold text-github-text">
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
    <div className="flex items-center gap-4 justify-center mt-2">
      {Object.entries(LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
          />
          <span className="text-xs text-github-textSecondary">{label}</span>
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
  if (isLoading) {
    return (
      <div className="bg-white border border-github-border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-github-border rounded-lg p-4 hover:shadow-cardHover transition-shadow">
      <h3 className="text-base font-semibold text-github-text mb-1">{title}</h3>
      <p className="text-xs text-github-textSecondary mb-2">{subtitle}</p>
      
      <CustomLegend />
      
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
              label={{ 
                value: 'Requests', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 11, fill: '#9ca3af' },
                offset: 10
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="edit" stackId="a" fill={COLORS.edit} radius={[0, 0, 0, 0]} />
            <Bar dataKey="ask" stackId="a" fill={COLORS.ask} radius={[0, 0, 0, 0]} />
            <Bar dataKey="agent" stackId="a" fill={COLORS.agent} radius={[0, 0, 0, 0]} />
            <Bar dataKey="custom" stackId="a" fill={COLORS.custom} radius={[0, 0, 0, 0]} />
            <Bar dataKey="inline" stackId="a" fill={COLORS.inline} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
