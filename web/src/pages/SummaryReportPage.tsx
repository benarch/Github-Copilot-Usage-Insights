import { useState } from 'react';
import { Timeframe } from '@/types';
import { useSummary, useCodeGeneration, useIDEUsage, useSeatInfo } from '@/hooks/useUsageData';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader2, Users, Bot, MessageSquare, Code2, CheckCircle, Monitor, CreditCard } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { data: summary, isLoading: summaryLoading } = useSummary(timeframe);
  const { data: codeGen, isLoading: codeGenLoading } = useCodeGeneration(timeframe);
  const { data: ideUsage, isLoading: ideLoading } = useIDEUsage(timeframe);
  const { data: seatInfo, isLoading: seatInfoLoading } = useSeatInfo(timeframe);

  const isLoading = summaryLoading || codeGenLoading || ideLoading || seatInfoLoading;

  // Target IDEs to display (with case-insensitive matching patterns)
  const targetIDEs = [
    { display: 'VS Code', patterns: ['vscode', 'vs code', 'visual studio code'] },
    { display: 'Visual Studio', patterns: ['visual studio', 'visualstudio'] },
    { display: 'JetBrains IDE', patterns: ['jetbrains', 'rider', 'webstorm', 'pycharm', 'phpstorm', 'rubymine', 'goland', 'clion', 'datagrip', 'appcode'] },
    { display: 'IntelliJ', patterns: ['intellij'] },
    { display: 'Neovim', patterns: ['neovim', 'nvim'] },
    { display: 'Eclipse', patterns: ['eclipse'] },
    { display: 'Xcode', patterns: ['xcode'] },
  ];

  // Process IDE usage data to match target IDEs
  const processedIDEUsage = targetIDEs.map(target => {
    // Find matching IDEs from the API data
    const matchingData = ideUsage?.filter(item => 
      target.patterns.some(pattern => 
        item.ide.toLowerCase().includes(pattern.toLowerCase())
      )
    ) || [];
    
    // Sum up users and interactions from all matching entries
    const totalUsers = matchingData.reduce((sum, item) => sum + item.users, 0);
    const totalInteractions = matchingData.reduce((sum, item) => sum + item.interactions, 0);
    
    return {
      ide: target.display,
      users: totalUsers,
      interactions: totalInteractions,
    };
  }).filter(item => item.users > 0); // Only show IDEs with users

  // IDE bar colors
  const ideColors = ['#58a6ff', '#3fb950', '#a371f7', '#d29922', '#f85149', '#8b949e', '#f778ba'];

  const timeframeOptions: { value: Timeframe; label: string; range: string }[] = [
    { value: '7', label: 'Last 7 days', range: formatDateRange(7).label },
    { value: '14', label: 'Last 14 days', range: formatDateRange(14).label },
    { value: '28', label: 'Last 28 days', range: formatDateRange(28).label },
    { value: '90', label: 'Last 3 months', range: formatDateRange(90).label },
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
        {!isLoading && summary && codeGen && ideUsage && (
          <div className="space-y-8">
            {/* Seat Information Section */}
            {seatInfo && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#d29922]" />
                  Copilot Seat Allocation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                      {seatInfo.totalSeats.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                      Total Seats
                    </div>
                    <div className="text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
                      Allocated Copilot licenses
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                    <div className="text-3xl font-bold text-[#3fb950]">
                      {seatInfo.activeSeats.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                      Active Seats
                    </div>
                    <div className="text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
                      Used in selected timeframe
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                    <div className="text-3xl font-bold text-[#f85149]">
                      {seatInfo.unusedSeats.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                      Unused Seats
                    </div>
                    <div className="text-xs text-gray-400 dark:text-dark-textSecondary mt-2">
                      Not utilized in timeframe
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                        {seatInfo.utilizationRate}%
                      </div>
                      <CheckCircle className={`w-6 h-6 ${seatInfo.utilizationRate >= 70 ? 'text-[#3fb950]' : seatInfo.utilizationRate >= 40 ? 'text-[#d29922]' : 'text-[#f85149]'}`} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-dark-textSecondary mt-1">
                      Utilization Rate
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-bgTertiary rounded-full h-2 mt-3">
                      <div 
                        className="h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${seatInfo.utilizationRate}%`,
                          backgroundColor: seatInfo.utilizationRate >= 70 ? '#3fb950' : seatInfo.utilizationRate >= 40 ? '#d29922' : '#f85149'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

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

            {/* IDE Usage Bar Chart Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#58a6ff]" />
                IDE Usage Distribution
              </h2>
              <div className="bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={processedIDEUsage}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDark ? '#21262d' : '#e5e7eb'} 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="ide" 
                        tick={{ fill: isDark ? '#8b949e' : '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: isDark ? '#30363d' : '#d1d5db' }}
                        tickLine={{ stroke: isDark ? '#30363d' : '#d1d5db' }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fill: isDark ? '#8b949e' : '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: isDark ? '#30363d' : '#d1d5db' }}
                        tickLine={{ stroke: isDark ? '#30363d' : '#d1d5db' }}
                        label={{ 
                          value: 'Users', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: isDark ? '#8b949e' : '#6b7280',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? '#161b22' : '#ffffff',
                          border: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                        labelStyle={{ 
                          color: isDark ? '#e6edf3' : '#111827',
                          fontWeight: 600,
                          marginBottom: '4px'
                        }}
                        itemStyle={{ color: isDark ? '#8b949e' : '#6b7280' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'users') return [`${value.toLocaleString()} users`, 'Active Users'];
                          if (name === 'interactions') return [`${value.toLocaleString()}`, 'Interactions'];
                          return [value.toLocaleString(), name];
                        }}
                        cursor={{ fill: isDark ? 'rgba(88, 166, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar 
                        dataKey="users" 
                        name="users"
                        radius={[4, 4, 0, 0]}
                      >
                        {processedIDEUsage.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={ideColors[index % ideColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                  {processedIDEUsage.map((item, index) => (
                    <div key={item.ide} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: ideColors[index % ideColors.length] }}
                      />
                      <span className="text-gray-600 dark:text-dark-textSecondary">
                        {item.ide}: {item.users} users, {item.interactions.toLocaleString()} interactions
                      </span>
                    </div>
                  ))}
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
