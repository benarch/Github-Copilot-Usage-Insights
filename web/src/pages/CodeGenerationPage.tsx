import { useState } from 'react';
import { Info, Download } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AreaChartCard } from '@/components/AreaChartCard';
import { TimeframeDropdown } from '@/components/TimeframeDropdown';
import { useCodeGeneration } from '@/hooks/useUsageData';
import type { Timeframe } from '@/types';

export function CodeGenerationPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('28');
  const { data: codeGenStats, isLoading } = useCodeGeneration(timeframe);

  // Transform data for chart
  const chartData = codeGenStats?.dailyData.map(d => ({
    date: d.date,
    value: d.suggestions
  })) || [];

  const acceptedChartData = codeGenStats?.dailyData.map(d => ({
    date: d.date,
    value: d.accepted
  })) || [];

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-github-text">Code generation</h1>
          <button className="text-github-textSecondary hover:text-github-text transition-colors">
            <Info size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200">
            Preview
          </span>
          <a href="#" className="text-sm text-primary-600 hover:underline">
            Give feedback
          </a>
          <TimeframeDropdown value={timeframe} onChange={setTimeframe} />
          <button className="p-2 hover:bg-github-bgSecondary border border-github-border rounded-md transition-colors">
            <Download size={16} className="text-github-textSecondary" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total suggestions"
          value={isLoading ? '...' : codeGenStats?.totalSuggestions.toLocaleString() || '0'}
          subtitle={`Code suggestions shown to users in the last ${timeframe} days`}
        />
        <StatsCard
          title="Accepted suggestions"
          value={isLoading ? '...' : codeGenStats?.acceptedSuggestions.toLocaleString() || '0'}
          subtitle={`Code suggestions accepted by users in the last ${timeframe} days`}
        />
        <StatsCard
          title="Acceptance rate"
          value={isLoading ? '...' : `${codeGenStats?.acceptanceRate || 0}%`}
          subtitle="Percentage of suggestions that were accepted"
          progress={codeGenStats ? {
            percentage: codeGenStats.acceptanceRate,
            label: `${codeGenStats.acceptedSuggestions.toLocaleString()} of ${codeGenStats.totalSuggestions.toLocaleString()}`
          } : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AreaChartCard
          title="Daily suggestions shown"
          subtitle="Number of code suggestions displayed to users per day"
          data={chartData}
          yAxisLabel="Suggestions"
          isLoading={isLoading}
          color="#8b5cf6"
        />
        <AreaChartCard
          title="Daily accepted suggestions"
          subtitle="Number of code suggestions accepted by users per day"
          data={acceptedChartData}
          yAxisLabel="Accepted"
          isLoading={isLoading}
          color="#22c55e"
        />
      </div>
    </div>
  );
}
