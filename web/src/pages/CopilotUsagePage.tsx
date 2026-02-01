import { useState, useRef, useMemo } from 'react';
import { Info, Upload } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AreaChartCard } from '@/components/AreaChartCard';
import { StackedBarChartCard } from '@/components/StackedBarChartCard';
import { StackedAreaChartCard } from '@/components/StackedAreaChartCard';
import { DonutChartCard } from '@/components/DonutChartCard';
import { MultiLineChartCard } from '@/components/MultiLineChartCard';
import { DynamicStackedBarChart } from '@/components/DynamicStackedBarChart';
import { TimeframeDropdown } from '@/components/TimeframeDropdown';
import { ExportDropdown, convertToJSON, convertToNDJSON, convertToCSV, downloadFile, type ExportFormat } from '@/components/ExportDropdown';
import { uploadJsonFile, fetchExportData } from '@/lib/api';
import { useNavCounts } from '@/contexts/NavCountsContext';
import { 
  useSummary, 
  useDailyActiveUsers, 
  useWeeklyActiveUsers, 
  useAvgChatRequests,
  useChatModeRequests,
  useModelDistribution,
  useModelUsagePerDay,
  useModelUsagePerLanguage,
  useModelUsagePerChatMode,
  useCodeCompletions,
  useAcceptanceRate,
  useIDEWeeklyActiveUsers
} from '@/hooks/useUsageData';
import type { Timeframe } from '@/types';

// Model usage per day colors - matching actual model names from API
const MODEL_USAGE_COLORS: Record<string, { color: string; dashed: boolean }> = {
  // Claude models - purple/indigo tones
  'claude-4.5-sonnet': { color: '#8b5cf6', dashed: false },    // Purple solid (most used)
  'claude-opus-4.5': { color: '#7c3aed', dashed: false },      // Violet solid
  'claude-4.0-sonnet': { color: '#6366f1', dashed: true },     // Indigo dashed
  'claude-4.5-haiku': { color: '#a78bfa', dashed: false },     // Light purple solid
  'claude-opus-4.1': { color: '#c4b5fd', dashed: true },       // Lavender dashed
  // GPT models - green/teal tones
  'gpt-5.2': { color: '#22c55e', dashed: false },              // Green solid
  'gpt-4.1': { color: '#16a34a', dashed: false },              // Dark green solid
  'gpt-5.2-codex': { color: '#059669', dashed: true },         // Emerald dashed
  'gpt-5.0': { color: '#2dd4bf', dashed: false },              // Teal solid
  'gpt-5.1-codex-max': { color: '#14b8a6', dashed: true },     // Darker teal dashed
  'gpt-5.1-codex': { color: '#0d9488', dashed: false },        // Teal solid
  'gpt-5.1': { color: '#0f766e', dashed: true },               // Dark teal dashed
  'gpt-5-codex': { color: '#115e59', dashed: false },          // Very dark teal solid
  'gpt-5-mini': { color: '#5eead4', dashed: true },            // Light teal dashed
  'gpt-4o': { color: '#4ade80', dashed: false },               // Light green solid
  'gpt-4o-mini': { color: '#86efac', dashed: true },           // Very light green dashed
  'gpt-5.1-codex-mini': { color: '#a7f3d0', dashed: false },   // Mint solid
  // Gemini models - amber/orange tones
  'gemini-3.0-pro': { color: '#f59e0b', dashed: false },       // Amber solid
  'gemini-2.5-pro': { color: '#d97706', dashed: true },        // Dark amber dashed
  'gemini-3.0-flash': { color: '#fbbf24', dashed: false },     // Yellow solid
  // Other models
  'auto': { color: '#64748b', dashed: true },                  // Slate dashed
  'grok-code-fast-1': { color: '#ec4899', dashed: false },     // Pink solid
};

// Model colors for language stacked bar chart (orange/brown tones like GitHub)
const MODEL_LANGUAGE_COLORS: Record<string, string> = {
  // Claude models
  'claude-4.5-sonnet': '#5c3d2e',     // Dark brown (most used)
  'claude-opus-4.5': '#78350f',       // Darker brown
  'claude-4.0-sonnet': '#92400e',     // Brown
  'claude-4.5-haiku': '#a16207',      // Dark amber
  'claude-opus-4.1': '#b45309',       // Dark orange
  // GPT models
  'gpt-5.2': '#d97706',               // Orange
  'gpt-4.1': '#ea580c',               // Bright orange
  'gpt-5.2-codex': '#dc2626',         // Red
  'gpt-5.0': '#e11d48',               // Rose
  'gpt-5.1-codex-max': '#f97316',     // Light orange
  'gpt-5.1-codex': '#fb923c',         // Lighter orange
  'gpt-5.1': '#fbbf24',               // Amber
  'gpt-5-codex': '#fcd34d',           // Yellow
  'gpt-5-mini': '#fde047',            // Light yellow
  'gpt-4o': '#fdba74',                // Pale orange
  'gpt-4o-mini': '#fed7aa',           // Very pale orange
  'gpt-5.1-codex-mini': '#fef3c7',    // Cream
  // Gemini models
  'gemini-3.0-pro': '#0891b2',        // Cyan
  'gemini-2.5-pro': '#06b6d4',        // Light cyan
  'gemini-3.0-flash': '#22d3ee',      // Lighter cyan
  // Other models
  'auto': '#64748b',                  // Slate
  'grok-code-fast-1': '#f472b6',      // Pink
};

// Chat mode colors - green scheme for requests per chat mode
const CHAT_MODE_COLORS: Record<string, string> = {
  edit: '#166534',    // Dark green
  ask: '#22c55e',     // Green  
  agent: '#4ade80',   // Light green
  custom: '#86efac',  // Lighter green
  inline: '#bbf7d0',  // Very light green
};

// IDE colors - blue scheme for IDE breakdowns
const IDE_COLORS: Record<string, string> = {
  'vscode': '#007ACC',           // VS Code blue
  'jetbrains': '#E95420',        // JetBrains orange
  'visualstudio': '#5C2D91',     // VS purple
  'neovim': '#57A143',           // Neovim green
  'vim': '#019733',              // Vim green
  'xcode': '#147EFB',            // Xcode blue
  'azure_data_studio': '#0078D4',// Azure blue
  'eclipse': '#2C2255',          // Eclipse purple
};

export function CopilotUsagePage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('28');
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshCounts } = useNavCounts();
  
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useSummary(timeframe);
  const { data: dailyUsers, isLoading: dailyLoading, refetch: refetchDaily } = useDailyActiveUsers(timeframe);
  const { data: weeklyUsers, isLoading: weeklyLoading, refetch: refetchWeekly } = useWeeklyActiveUsers(timeframe);
  const { data: avgChatRequests, isLoading: avgChatLoading, refetch: refetchAvgChat } = useAvgChatRequests(timeframe);
  const { data: chatModeRequests, isLoading: chatModeLoading, refetch: refetchChatMode } = useChatModeRequests(timeframe);
  const { data: modelDistribution, isLoading: modelDistLoading, refetch: refetchModelDist } = useModelDistribution(timeframe);
  const { data: modelUsagePerDay, isLoading: modelDayLoading, refetch: refetchModelDay } = useModelUsagePerDay(timeframe);
  const { data: modelUsagePerLanguage, isLoading: modelLangLoading, refetch: refetchModelLang } = useModelUsagePerLanguage(timeframe);
  const { data: modelUsagePerChatMode, isLoading: modelChatModeLoading, refetch: refetchModelChatMode } = useModelUsagePerChatMode(timeframe);
  const { data: codeCompletions, isLoading: completionsLoading, refetch: refetchCompletions } = useCodeCompletions(timeframe);
  const { data: acceptanceRate, isLoading: acceptanceLoading, refetch: refetchAcceptance } = useAcceptanceRate(timeframe);
  const { data: ideWeeklyActiveUsers, isLoading: ideWeeklyLoading, refetch: refetchIdeWeekly } = useIDEWeeklyActiveUsers(timeframe);

  // Transform IDE weekly data for stacked bar chart
  const ideWeeklyData = useMemo(() => {
    if (!ideWeeklyActiveUsers || ideWeeklyActiveUsers.length === 0) return [];
    
    // Group by week and pivot IDE data
    const weekMap = new Map<string, Record<string, number>>();
    for (const row of ideWeeklyActiveUsers) {
      if (!weekMap.has(row.week_start)) {
        weekMap.set(row.week_start, { date: row.week_start } as any);
      }
      const week = weekMap.get(row.week_start)!;
      week[row.ide] = row.users;
    }
    return Array.from(weekMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [ideWeeklyActiveUsers]);

  // Get unique IDE names for the chart
  const ideNames = useMemo(() => {
    if (!ideWeeklyActiveUsers) return [];
    return [...new Set(ideWeeklyActiveUsers.map(r => r.ide))];
  }, [ideWeeklyActiveUsers]);

  // IDE bars configuration - use a color scheme with fallback
  const ideBars = ideNames.map((ide, index) => ({
    key: ide,
    name: ide,
    color: IDE_COLORS[ide] || `hsl(${index * 45}, 70%, 50%)`
  }));

  // Sort models by total usage (descending) for consistent ordering
  const sortedModelKeys = useMemo(() => {
    if (!modelUsagePerDay || modelUsagePerDay.length === 0) return [];
    const totals: Record<string, number> = {};
    for (const day of modelUsagePerDay) {
      for (const [key, val] of Object.entries(day)) {
        if (key !== 'date' && typeof val === 'number') {
          totals[key] = (totals[key] || 0) + val;
        }
      }
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);
  }, [modelUsagePerDay]);

  // Areas config for stacked area chart (Model usage per day)
  const modelAreas = sortedModelKeys.map((key, index) => {
    const config = MODEL_USAGE_COLORS[key] || { color: `hsl(${index * 30}, 70%, 50%)`, dashed: index % 2 === 0 };
    return {
      key,
      name: key,
      color: config.color,
      strokeDasharray: config.dashed ? '5 5' : undefined
    };
  });

  // Language chart model bars configuration - use orange/brown colors
  const languageModelKeys = modelUsagePerLanguage && modelUsagePerLanguage.length > 0
    ? Object.keys(modelUsagePerLanguage[0]).filter(k => k !== 'language')
    : [];
  
  const languageModelBars = languageModelKeys.map(key => ({
    key,
    name: key,
    color: MODEL_LANGUAGE_COLORS[key] || '#8b949e'
  }));

  // Chat mode bars configuration for model usage per chat mode - blue scheme
  const chatModeBars = [
    { key: 'edit', name: 'Edit', color: '#0d1b3e' },
    { key: 'ask', name: 'Ask', color: '#1f4b99' },
    { key: 'agent', name: 'Agent', color: '#5a8ed4' },
    { key: 'custom', name: 'Custom', color: '#8bb4e7' },
    { key: 'inline', name: 'Inline', color: '#c4d9f2' },
  ];

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
      // Refetch all data to show new records
      refetchSummary();
      refetchDaily();
      refetchWeekly();
      refetchAvgChat();
      refetchChatMode();
      refetchModelDist();
      refetchModelDay();
      refetchModelLang();
      refetchModelChatMode();
      refetchCompletions();
      refetchAcceptance();
      refetchIdeWeekly();
      refreshCounts();
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const data = await fetchExportData();
      if (data.length === 0) {
        alert('No data to export');
        return;
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'json') {
        const content = convertToJSON(data);
        downloadFile(content, `copilot-usage-${timestamp}.json`, 'application/json');
      } else if (format === 'ndjson') {
        const content = convertToNDJSON(data);
        downloadFile(content, `copilot-usage-${timestamp}.ndjson`, 'application/x-ndjson');
      } else {
        const content = convertToCSV(data);
        downloadFile(content, `copilot-usage-${timestamp}.csv`, 'text/csv');
      }
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-github-text dark:text-dark-text">Copilot IDE usage</h1>
          <div className="relative group">
            <button className="text-github-textSecondary dark:text-dark-textSecondary hover:text-github-text dark:hover:text-dark-text transition-colors">
              <Info size={16} />
            </button>
            <div className="absolute left-0 top-full mt-2 w-80 p-4 bg-white dark:bg-dark-bgSecondary border border-github-border dark:border-dark-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <h3 className="font-semibold text-github-text dark:text-dark-text mb-2">Copilot IDE Usage Dashboard</h3>
              <p className="text-sm text-github-textSecondary dark:text-dark-textSecondary">Track GitHub Copilot adoption metrics including active users, chat interactions, model usage distribution, and IDE-specific statistics. Monitor how your team uses Copilot across different development tools.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-200 dark:border-primary-800">
            Preview
          </span>
          <a href="https://github.com/benarch/Github-Copilot-Usage-Extended-Insights/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
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
          <ExportDropdown onExport={handleExport} isExporting={isExporting} />
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
          darkColor="#58a6ff"
        />
        <DynamicStackedBarChart
          title="IDE weekly active users"
          subtitle="Unique users who used Copilot per IDE each week"
          data={ideWeeklyData}
          bars={ideBars}
          xAxisKey="date"
          yAxisLabel="Users"
          isLoading={ideWeeklyLoading}
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
          darkColor="#58a6ff"
        />
      </div>

      {/* 1. Requests per chat mode */}
      <div className="mb-4">
        <StackedBarChartCard
          title="Requests per chat mode"
          subtitle="User-initiated chat requests across all modes"
          data={chatModeRequests || []}
          isLoading={chatModeLoading}
        />
      </div>

      {/* 2. Code completions */}
      <div className="mb-4">
        <MultiLineChartCard
          title="Code completions"
          subtitle="Inline code suggestions shown and accepted"
          data={codeCompletions || []}
          lines={[
            { key: 'accepted', name: 'Accepted completions', color: '#8b5cf6' },
            { key: 'suggested', name: 'Suggested completions', color: '#a371f7', strokeDasharray: '5 5' },
          ]}
          yAxisLabel="Completions"
          isLoading={completionsLoading}
        />
      </div>

      {/* 3. Code completions acceptance rate */}
      <div className="mb-4">
        <AreaChartCard
          title="Code completions acceptance rate"
          subtitle="Percentage of shown inline completions that were either fully or partially accepted"
          data={acceptanceRate?.map(d => ({ date: d.date, value: d.rate })) || []}
          yAxisLabel="%"
          isLoading={acceptanceLoading}
          color="#22c55e"
          darkColor="#3fb950"
        />
      </div>

      {/* 4. Model usage per day */}
      <div className="mb-4">
        <StackedAreaChartCard
          title="Model usage per day"
          subtitle="Daily breakdown of models used in requests across all chat modes, excluding code completions"
          data={modelUsagePerDay || []}
          areas={modelAreas}
          yAxisLabel="%"
          yAxisDomain={[0, 100]}
          showPercentage={true}
          isLoading={modelDayLoading}
        />
      </div>

      {/* 5. Chat model usage & 6. Model usage per chat mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DonutChartCard
          title="Chat model usage"
          subtitle="Distribution of models used across all chat modes"
          data={modelDistribution || []}
          isLoading={modelDistLoading}
        />

        <DynamicStackedBarChart
          title="Model usage per chat mode"
          subtitle="Most frequently used models for user-initiated chat requests"
          data={modelUsagePerChatMode || []}
          xAxisKey="model"
          bars={chatModeBars}
          isLoading={modelChatModeLoading}
        />
      </div>

      {/* 7. Language usage per day - derived from language data */}
      <div className="mb-4">
        <StackedAreaChartCard
          title="Language usage per day"
          subtitle="Daily breakdown of programming languages used in code completions"
          data={modelUsagePerDay || []}
          areas={modelAreas.slice(0, 5).map((area, i) => ({
            ...area,
            name: ['TypeScript', 'Python', 'JavaScript', 'Java', 'Other languages'][i] || area.name,
            color: ['#3b82f6', '#8b5cf6', '#22c55e', '#14b8a6', '#f59e0b'][i] || area.color,
            strokeDasharray: [true, true, false, true, false][i] ? '5 5' : undefined,
          }))}
          yAxisLabel="%"
          yAxisDomain={[0, 100]}
          showPercentage={true}
          isLoading={modelDayLoading}
        />
      </div>

      {/* 8. Language usage - Donut chart for language distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DonutChartCard
          title="Language usage"
          subtitle="Distribution of programming languages used across all code completions"
          data={modelDistribution?.map((d, i) => ({
            ...d,
            name: ['TypeScript', 'Python', 'JavaScript', 'Java', 'Other languages'][i] || d.name
          })) || []}
          isLoading={modelDistLoading}
          colors={['#5c3d2e', '#d97706', '#f4a460', '#fbbf24', '#fef3c7']}
        />

        {/* 9. Model usage per language */}
        <DynamicStackedBarChart
          title="Model usage per language"
          subtitle="Most frequently used model in each language for user-initiated chat requests"
          data={modelUsagePerLanguage || []}
          xAxisKey="language"
          bars={languageModelBars}
          yAxisLabel="%"
          isLoading={modelLangLoading}
        />
      </div>
    </div>
  );
}
