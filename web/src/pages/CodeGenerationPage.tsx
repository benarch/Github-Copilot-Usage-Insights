import { useState, useRef } from 'react';
import { Info, Download, Upload } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AreaChartCard } from '@/components/AreaChartCard';
import { MultiLineChartCard } from '@/components/MultiLineChartCard';
import { GroupedBarChartCard } from '@/components/GroupedBarChartCard';
import { TimeframeDropdown } from '@/components/TimeframeDropdown';
import { 
  useCodeGeneration, 
  useCodeCompletions, 
  useAcceptanceRate,
  useCodeGenSummary,
  useDailyLines,
  useUserCodeChangesByMode,
  useAgentCodeChanges,
  useUserCodeChangesByModel,
  useAgentCodeChangesByModel,
  useUserCodeChangesByLanguage,
  useAgentCodeChangesByLanguage
} from '@/hooks/useUsageData';
import { uploadJsonFile } from '@/lib/api';
import type { Timeframe } from '@/types';

export function CodeGenerationPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('28');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: codeGenStats, isLoading, refetch } = useCodeGeneration(timeframe);
  const { data: codeCompletions, isLoading: completionsLoading, refetch: refetchCompletions } = useCodeCompletions(timeframe);
  const { data: acceptanceRate, isLoading: acceptanceLoading, refetch: refetchAcceptance } = useAcceptanceRate(timeframe);
  const { data: codeGenSummary, isLoading: summaryLoading } = useCodeGenSummary(timeframe);
  const { data: dailyLines, isLoading: dailyLinesLoading } = useDailyLines(timeframe);
  const { data: userChangesByMode, isLoading: modeLoading } = useUserCodeChangesByMode(timeframe);
  const { data: agentChanges, isLoading: agentLoading } = useAgentCodeChanges(timeframe);
  const { data: userChangesByModel, isLoading: userModelLoading } = useUserCodeChangesByModel(timeframe);
  const { data: agentChangesByModel, isLoading: agentModelLoading } = useAgentCodeChangesByModel(timeframe);
  const { data: userChangesByLanguage, isLoading: userLangLoading } = useUserCodeChangesByLanguage(timeframe);
  const { data: agentChangesByLanguage, isLoading: agentLangLoading } = useAgentCodeChangesByLanguage(timeframe);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && !file.name.endsWith('.ndjson')) {
      alert('Please select a JSON or NDJSON file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadJsonFile(file);
      alert(`Upload successful! ${result.recordsImported || 0} records imported.`);
      refetch();
      refetchCompletions();
      refetchAcceptance();
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Transform acceptance rate data for chart
  const acceptanceRateChartData = acceptanceRate?.map(d => ({
    date: d.date,
    value: d.rate
  })) || [];

  // Lines configuration for code completions chart
  const completionLines = [
    { key: 'accepted', name: 'Accepted completions', color: '#8b5cf6' },
    { key: 'suggested', name: 'Suggested completions', color: '#a371f7', strokeDasharray: '5 5' },
  ];

  // Lines configuration for daily lines chart
  const dailyLinesConfig = [
    { key: 'added', name: 'Lines added', color: '#3fb950' },
    { key: 'deleted', name: 'Lines deleted', color: '#f85149' },
  ];

  // Transform data for grouped bar charts
  const userModeChartData = userChangesByMode?.map(d => ({
    category: d.mode,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const agentChartData = agentChanges?.map(d => ({
    category: d.mode,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const userModelChartData = userChangesByModel?.map(d => ({
    category: d.model,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const agentModelChartData = agentChangesByModel?.map(d => ({
    category: d.model,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const userLangChartData = userChangesByLanguage?.map(d => ({
    category: d.language,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const agentLangChartData = agentChangesByLanguage?.map(d => ({
    category: d.language,
    linesAdded: d.linesAdded,
    linesDeleted: d.linesDeleted,
  })) || [];

  const barConfig = [
    { key: 'linesAdded', name: 'Lines added', color: '#3fb950' },
    { key: 'linesDeleted', name: 'Lines deleted', color: '#f85149' },
  ];

  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-github-text dark:text-dark-text">Code generation</h1>
          <button className="text-github-textSecondary dark:text-dark-textSecondary hover:text-github-text dark:hover:text-dark-text transition-colors">
            <Info size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-200 dark:border-primary-800">
            Preview
          </span>
          <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Give feedback
          </a>
          <TimeframeDropdown value={timeframe} onChange={setTimeframe} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.ndjson"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="p-2 hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary border border-github-border dark:border-dark-border rounded-md transition-colors disabled:opacity-50"
            title="Upload JSON file for analysis"
          >
            <Upload size={16} className="text-github-textSecondary dark:text-dark-textSecondary" />
          </button>
          <button className="p-2 hover:bg-github-bgSecondary dark:hover:bg-dark-bgTertiary border border-github-border dark:border-dark-border rounded-md transition-colors">
            <Download size={16} className="text-github-textSecondary dark:text-dark-textSecondary" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row - Code Completions */}
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

      {/* Code Completions Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <MultiLineChartCard
          title="Code completions"
          subtitle="Inline code suggestions shown and accepted"
          data={codeCompletions || []}
          lines={completionLines}
          yAxisLabel="Completions"
          isLoading={completionsLoading}
        />
        
        <AreaChartCard
          title="Code completions acceptance rate"
          subtitle="Percentage of shown inline completions that were either fully or partially accepted"
          data={acceptanceRateChartData}
          yAxisLabel="%"
          isLoading={acceptanceLoading}
          color="#22c55e"
          darkColor="#3fb950"
        />
      </div>

      {/* Lines of Code Section Header */}
      <h2 className="text-lg font-semibold text-github-text dark:text-dark-text mb-4 mt-8">Lines of code</h2>

      {/* Stats Cards Row - LOC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Lines of code changed"
          value={summaryLoading ? '...' : formatLargeNumber(codeGenSummary?.totalLinesChanged || 0)}
          subtitle={`Total lines added and deleted in the last ${timeframe} days`}
        />
        <StatsCard
          title="Agent contribution"
          value={summaryLoading ? '...' : `${codeGenSummary?.agentContributionPct || 0}%`}
          subtitle="Percentage of code changes from agent-initiated actions"
        />
        <StatsCard
          title="Average lines deleted"
          value={summaryLoading ? '...' : formatLargeNumber(codeGenSummary?.avgLinesDeleted || 0)}
          subtitle="Average lines deleted per day"
        />
      </div>

      {/* Daily Lines Chart - Full Width */}
      <div className="mb-6">
        <MultiLineChartCard
          title="Lines added and deleted"
          subtitle="Daily breakdown of code changes"
          data={dailyLines || []}
          lines={dailyLinesConfig}
          yAxisLabel="Lines"
          isLoading={dailyLinesLoading}
        />
      </div>

      {/* User vs Agent Changes by Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GroupedBarChartCard
          title="User-initiated code changes"
          subtitle="Lines added and deleted by mode"
          data={userModeChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={modeLoading}
          formatValue={formatLargeNumber}
        />
        
        <GroupedBarChartCard
          title="Agent-initiated code changes"
          subtitle="Lines added and deleted by agent"
          data={agentChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={agentLoading}
          formatValue={formatLargeNumber}
        />
      </div>

      {/* Changes by Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GroupedBarChartCard
          title="User-initiated code changes per model"
          subtitle="Which models generate the most code"
          data={userModelChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={userModelLoading}
          formatValue={formatLargeNumber}
        />
        
        <GroupedBarChartCard
          title="Agent-initiated code changes per model"
          subtitle="Which models agents use most"
          data={agentModelChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={agentModelLoading}
          formatValue={formatLargeNumber}
        />
      </div>

      {/* Changes by Language */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GroupedBarChartCard
          title="User-initiated code changes per language"
          subtitle="Which languages users work with most"
          data={userLangChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={userLangLoading}
          formatValue={formatLargeNumber}
        />
        
        <GroupedBarChartCard
          title="Agent-initiated code changes per language"
          subtitle="Which languages agents work with most"
          data={agentLangChartData}
          bars={barConfig}
          categoryKey="category"
          isLoading={agentLangLoading}
          formatValue={formatLargeNumber}
        />
      </div>
    </div>
  );
}
