import { useState } from 'react';
import { Info, Download } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AreaChartCard } from '@/components/AreaChartCard';
import { StackedBarChartCard } from '@/components/StackedBarChartCard';
import { TimeframeDropdown } from '@/components/TimeframeDropdown';
import { 
  useSummary, 
  useDailyActiveUsers, 
  useWeeklyActiveUsers, 
  useAvgChatRequests,
  useChatModeRequests 
} from '@/hooks/useUsageData';
import type { Timeframe } from '@/types';

export function CopilotUsagePage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('28');
  
  const { data: summary, isLoading: summaryLoading } = useSummary(timeframe);
  const { data: dailyUsers, isLoading: dailyLoading } = useDailyActiveUsers(timeframe);
  const { data: weeklyUsers, isLoading: weeklyLoading } = useWeeklyActiveUsers(timeframe);
  const { data: avgChatRequests, isLoading: avgChatLoading } = useAvgChatRequests(timeframe);
  const { data: chatModeRequests, isLoading: chatModeLoading } = useChatModeRequests(timeframe);

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-github-text">Copilot IDE usage</h1>
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
          title="IDE active users"
          value={summaryLoading ? '...' : summary?.ideActiveUsers.toLocaleString() || '0'}
          subtitle="Copilot-licensed users who interacted with Copilot in the current calendar month"
          link={{ text: 'Manage licenses', href: '#' }}
        />
        <StatsCard
          title="Agent adoption"
          value={summaryLoading ? '...' : `${summary?.agentAdoption.percentage || 0}%`}
          subtitle="Active users who used any agent feature in the current calendar month"
          progress={summary ? {
            percentage: summary.agentAdoption.percentage,
            label: `${summary.agentAdoption.agentUsers} out of ${summary.agentAdoption.totalActiveUsers} active users`
          } : undefined}
        />
        <StatsCard
          title="Most used chat model"
          value={summaryLoading ? '...' : summary?.mostUsedChatModel.name || 'N/A'}
          subtitle={`Model with the highest number of chat requests in the last ${timeframe} days`}
        />
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AreaChartCard
          title="IDE daily active users"
          subtitle="Unique users who used Copilot on a given day, either via chat or code completions"
          data={dailyUsers || []}
          isLoading={dailyLoading}
        />
        <AreaChartCard
          title="IDE weekly active users"
          subtitle="Unique users who used Copilot on a given week, either via chat or code completions"
          data={weeklyUsers || []}
          isLoading={weeklyLoading}
        />
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="mb-4">
        <AreaChartCard
          title="Average chat requests per active user"
          subtitle="User-initiated requests across all chat modes, excluding code completions"
          data={avgChatRequests || []}
          yAxisLabel="Requests"
          isLoading={avgChatLoading}
        />
      </div>

      {/* Stacked Bar Chart */}
      <div>
        <StackedBarChartCard
          title="Requests per chat mode"
          subtitle="User-initiated chat requests across all modes"
          data={chatModeRequests || []}
          isLoading={chatModeLoading}
        />
      </div>
    </div>
  );
}
