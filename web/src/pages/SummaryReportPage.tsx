import { useState } from 'react';
import { Timeframe } from '@/types';
import { useSummary, useCodeGeneration } from '@/hooks/useUsageData';
import { Loader2, Users, Bot, MessageSquare, Code2, CheckCircle } from 'lucide-react';

function formatDateRange(days: number): { start: string; end: string; label: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `${formatDate(start)} - ${formatDate(end)}`
  };
}

export function SummaryReportPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('28');
  
  const { data: summary, isLoading: summaryLoading } = useSummary(timeframe);
  const { data: codeGen, isLoading: codeGenLoading } = useCodeGeneration(timeframe);

  const isLoading = summaryLoading || codeGenLoading;

  const timeframeOptions: { value: Timeframe; label: string; range: string }[] = [
    { value: '7', label: 'Last 7 days', range: formatDateRange(7).label },
    { value: '14', label: 'Last 14 days', range: formatDateRange(14).label },
    { value: '28', label: 'Last 28 days', range: formatDateRange(28).label },
  ];

  const currentRange = formatDateRange(parseInt(timeframe));

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              Summary Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
              {currentRange.label}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.range})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Summary Cards */}
        {!isLoading && summary && codeGen && (
          <div className="space-y-8">
            {/* Usage Overview Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#58a6ff]" />
                Usage Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                    {summary.ideActiveUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    IDE Active Users
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                    {summary.agentAdoption.percentage}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    Agent Adoption Rate
                  </div>
                  <div className="text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
                    {summary.agentAdoption.agentUsers} of {summary.agentAdoption.totalActiveUsers} users
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                    {summary.mostUsedChatModel.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    Most Used Chat Model
                  </div>
                  <div className="text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
                    {summary.mostUsedChatModel.requests.toLocaleString()} requests
                  </div>
                </div>
              </div>
            </section>

            {/* Code Generation Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#a371f7]" />
                Code Generation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                    {codeGen.totalSuggestions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    Total Suggestions
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="text-3xl font-bold text-[#3fb950]">
                    {codeGen.acceptedSuggestions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    Accepted Suggestions
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                      {codeGen.acceptanceRate}%
                    </div>
                    <CheckCircle className="w-6 h-6 text-[#3fb950]" />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                    Acceptance Rate
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-bgTertiary rounded-full h-2 mt-3">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${codeGen.acceptanceRate}%`,
                        backgroundColor: '#3fb950'
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Agent & Chat Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#3fb950]" />
                Agent & Chat Usage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                        {summary.agentAdoption.agentUsers}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                        Agent Users
                      </div>
                    </div>
                    <Bot className="w-10 h-10 text-[#3fb950] opacity-50" />
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                        {summary.mostUsedChatModel.requests.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                        Total Chat Requests
                      </div>
                    </div>
                    <MessageSquare className="w-10 h-10 text-[#58a6ff] opacity-50" />
                  </div>
                </div>
              </div>
            </section>

            {/* Report Period Info */}
            <section className="mt-8 p-4 bg-gray-50 dark:bg-dark-bgSecondary rounded-lg border border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-textSecondary">
                <span className="font-medium">Report Period:</span>
                <span>{currentRange.start} to {currentRange.end}</span>
                <span className="text-gray-400">|</span>
                <span>{timeframe} days</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
