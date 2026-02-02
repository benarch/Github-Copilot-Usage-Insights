import { useState, useMemo, useRef } from 'react';
import { useUserDetails } from '@/hooks/useUsageData';
import { useImportData } from '@/contexts/ImportDataContext';
import { Timeframe } from '@/types';
import { 
  Users2, 
  Search, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus,
  CheckCircle, 
  XCircle,
  Calendar,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown
} from 'lucide-react';

interface TeamMemberStats {
  username: string;
  hasCopilotSeat: boolean;
  suggestions: number;
  acceptances: number;
  acceptanceRate: number;
  activeDays: number;
}

interface TeamSummary {
  teamName: string;
  organization: string;
  totalMembers: number;
  membersWithSeats: number;
  seatsPercentage: number;
  activeUsers: number;
  totalSuggestions: number;
  totalAcceptances: number;
  avgAcceptanceRate: number;
  avgAcceptancesPerUser: number;
  memberStats: TeamMemberStats[];
}

type SortField = 'username' | 'suggestions' | 'acceptances' | 'acceptanceRate' | 'activeDays';
type SortOrder = 'asc' | 'desc';

function formatDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function TeamUsageReportPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('acceptances');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const teamSelectorRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const { teams: importedTeams, users: importedUsers } = useImportData();
  const { data, isLoading } = useUserDetails(timeframe, 1, 10000, '');

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: '7', label: `Last 7 days` },
    { value: '14', label: `Last 14 days` },
    { value: '28', label: `Last 28 days` },
  ];

  // Build user to teams map
  const userToTeamsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    importedUsers.forEach(user => {
      map.set(user.login.toLowerCase(), user.teams);
      map.set(String(user.id), user.teams);
    });
    return map;
  }, [importedUsers]);

  // Build team summaries
  const teamSummaries = useMemo((): TeamSummary[] => {
    if (!data?.data || importedTeams.length === 0) return [];

    const summaries: TeamSummary[] = [];

    importedTeams.forEach(team => {
      const fullTeamName = team.organization ? `${team.organization}/${team.name}` : team.name;
      
      // Get all usage records for this team's members
      const teamUsageData = data.data.filter(row => {
        const userLogin = row.user_login.toLowerCase();
        const userId = String(row.user_id);
        const userTeams = userToTeamsMap.get(userLogin) || userToTeamsMap.get(userId) || [];
        return userTeams.includes(fullTeamName);
      });

      // Aggregate member stats
      const memberStatsMap = new Map<string, TeamMemberStats>();
      const activeDaysMap = new Map<string, Set<string>>();

      teamUsageData.forEach(row => {
        const username = row.user_login;
        const suggestions = row.code_generation_activity_count || 0;
        const acceptances = row.code_acceptance_activity_count || 0;

        if (!memberStatsMap.has(username)) {
          memberStatsMap.set(username, {
            username,
            hasCopilotSeat: suggestions > 0 || acceptances > 0,
            suggestions: 0,
            acceptances: 0,
            acceptanceRate: 0,
            activeDays: 0
          });
          activeDaysMap.set(username, new Set());
        }

        const stats = memberStatsMap.get(username)!;
        stats.suggestions += suggestions;
        stats.acceptances += acceptances;

        if (suggestions > 0 || acceptances > 0) {
          activeDaysMap.get(username)!.add(row.day);
        }
      });

      // Calculate acceptance rates and active days
      memberStatsMap.forEach((stats, username) => {
        stats.acceptanceRate = stats.suggestions > 0 ? (stats.acceptances / stats.suggestions) * 100 : 0;
        stats.activeDays = activeDaysMap.get(username)?.size || 0;
      });

      const memberStats = Array.from(memberStatsMap.values());
      const membersWithSeats = memberStats.filter(m => m.hasCopilotSeat).length;
      const activeUsers = memberStats.filter(m => m.activeDays > 0).length;
      const totalSuggestions = memberStats.reduce((sum, m) => sum + m.suggestions, 0);
      const totalAcceptances = memberStats.reduce((sum, m) => sum + m.acceptances, 0);
      const avgAcceptanceRate = totalSuggestions > 0 ? (totalAcceptances / totalSuggestions) * 100 : 0;
      const avgAcceptancesPerUser = activeUsers > 0 ? totalAcceptances / activeUsers : 0;

      summaries.push({
        teamName: team.name,
        organization: team.organization,
        totalMembers: team.memberCount,
        membersWithSeats,
        seatsPercentage: team.memberCount > 0 ? (membersWithSeats / team.memberCount) * 100 : 0,
        activeUsers,
        totalSuggestions,
        totalAcceptances,
        avgAcceptanceRate,
        avgAcceptancesPerUser,
        memberStats
      });
    });

    return summaries;
  }, [data, importedTeams, userToTeamsMap]);

  // Filter teams by search
  const filteredTeamOptions = useMemo(() => {
    return importedTeams.filter(team => {
      const fullName = team.organization ? `${team.organization}/${team.name}` : team.name;
      return fullName.toLowerCase().includes(teamSearchQuery.toLowerCase());
    });
  }, [importedTeams, teamSearchQuery]);

  // Get selected team summaries
  const selectedTeamSummaries = useMemo(() => {
    if (selectedTeams.length === 0) return teamSummaries;
    return teamSummaries.filter(summary => {
      const fullName = summary.organization ? `${summary.organization}/${summary.teamName}` : summary.teamName;
      return selectedTeams.includes(fullName);
    });
  }, [teamSummaries, selectedTeams]);

  // Aggregate data across selected teams
  const aggregatedStats = useMemo(() => {
    const totalMembers = selectedTeamSummaries.reduce((sum, t) => sum + t.totalMembers, 0);
    const totalMembersWithSeats = selectedTeamSummaries.reduce((sum, t) => sum + t.membersWithSeats, 0);
    const totalActiveUsers = selectedTeamSummaries.reduce((sum, t) => sum + t.activeUsers, 0);
    const totalSuggestions = selectedTeamSummaries.reduce((sum, t) => sum + t.totalSuggestions, 0);
    const totalAcceptances = selectedTeamSummaries.reduce((sum, t) => sum + t.totalAcceptances, 0);

    return {
      totalMembers,
      totalMembersWithSeats,
      seatsPercentage: totalMembers > 0 ? (totalMembersWithSeats / totalMembers) * 100 : 0,
      totalActiveUsers,
      totalSuggestions,
      totalAcceptances,
      avgAcceptanceRate: totalSuggestions > 0 ? (totalAcceptances / totalSuggestions) * 100 : 0,
      avgAcceptancesPerUser: totalActiveUsers > 0 ? totalAcceptances / totalActiveUsers : 0
    };
  }, [selectedTeamSummaries]);

  // Combine all member stats
  const allMemberStats = useMemo(() => {
    const statsMap = new Map<string, TeamMemberStats>();
    
    selectedTeamSummaries.forEach(summary => {
      summary.memberStats.forEach(member => {
        if (statsMap.has(member.username)) {
          const existing = statsMap.get(member.username)!;
          existing.suggestions += member.suggestions;
          existing.acceptances += member.acceptances;
          existing.activeDays = Math.max(existing.activeDays, member.activeDays);
          existing.hasCopilotSeat = existing.hasCopilotSeat || member.hasCopilotSeat;
          existing.acceptanceRate = existing.suggestions > 0 ? (existing.acceptances / existing.suggestions) * 100 : 0;
        } else {
          statsMap.set(member.username, { ...member });
        }
      });
    });

    return Array.from(statsMap.values());
  }, [selectedTeamSummaries]);

  // Filter and sort member stats
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = allMemberStats;

    if (searchQuery) {
      filtered = filtered.filter(m => m.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [allMemberStats, searchQuery, sortField, sortOrder]);

  const handleTeamToggle = (teamFullName: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamFullName) 
        ? prev.filter(t => t !== teamFullName)
        : [...prev, teamFullName]
    );
  };

  const handleSelectAllTeams = () => {
    const allTeamNames = filteredTeamOptions.map(t => 
      t.organization ? `${t.organization}/${t.name}` : t.name
    );
    setSelectedTeams(allTeamNames);
  };

  const handleClearSelection = () => {
    setSelectedTeams([]);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Username', 'Copilot Seat', 'Suggestions', 'Acceptances', 'Acceptance Rate %', 'Active Days'];
    const rows = filteredAndSortedMembers.map(m => [
      m.username,
      m.hasCopilotSeat ? 'Yes' : 'No',
      m.suggestions,
      m.acceptances,
      m.acceptanceRate.toFixed(2),
      m.activeDays
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-usage-report-${timeframe}days-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    // For Excel, we'll use CSV format with .xlsx extension
    // In production, you'd use a library like xlsx
    exportToCSV();
  };

  const exportToPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const getTrendIcon = (value: number, threshold: number = 50) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < threshold) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users2 className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                  Team Usage Report
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Download and analyze team-specific Copilot usage reports
                </p>
              </div>
            </div>

            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bgTertiary text-left transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-900 dark:text-dark-text">Export CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bgTertiary text-left transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-900 dark:text-dark-text">Export Excel</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bgTertiary text-left transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-900 dark:text-dark-text">Export PDF</span>
                  </button>
                  <button
                    onClick={() => { window.print(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bgTertiary text-left transition-colors border-t border-gray-200 dark:border-dark-border"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-dark-text">Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Team Selector */}
            <div className="relative" ref={teamSelectorRef}>
              <button
                onClick={() => setShowTeamSelector(!showTeamSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-bgSecondary border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bgTertiary transition-colors"
              >
                <Users2 className="w-4 h-4" />
                {selectedTeams.length === 0 ? 'All Teams' : `${selectedTeams.length} Team(s) Selected`}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showTeamSelector && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-dark-bgSecondary border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 dark:border-dark-border">
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bgTertiary text-gray-900 dark:text-dark-text"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSelectAllTeams}
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleClearSelection}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {filteredTeamOptions.map(team => {
                      const fullName = team.organization ? `${team.organization}/${team.name}` : team.name;
                      const isSelected = selectedTeams.includes(fullName);
                      return (
                        <label
                          key={fullName}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-bgTertiary cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTeamToggle(fullName)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-900 dark:text-dark-text">{fullName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-bgSecondary border border-gray-300 dark:border-dark-border rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="bg-transparent border-none text-sm text-gray-900 dark:text-dark-text focus:outline-none"
              >
                {timeframeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDateRange(Number(timeframe))}
            </div>
          </div>
        </div>

        {/* Team Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Members Card */}
          <div className="bg-white dark:bg-dark-bgSecondary rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Team Members</h3>
              {getTrendIcon(aggregatedStats.totalMembers, 10)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-dark-text">{aggregatedStats.totalMembers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Across {selectedTeams.length || teamSummaries.length} team(s)
            </p>
          </div>

          {/* Members with Seats Card */}
          <div className="bg-white dark:bg-dark-bgSecondary rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Copilot Seats</h3>
              {getTrendIcon(aggregatedStats.seatsPercentage, 50)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-dark-text">{aggregatedStats.totalMembersWithSeats}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {aggregatedStats.seatsPercentage.toFixed(1)}% of total members
            </p>
          </div>

          {/* Active Users Card */}
          <div className="bg-white dark:bg-dark-bgSecondary rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</h3>
              {getTrendIcon(aggregatedStats.totalActiveUsers, aggregatedStats.totalMembers / 2)}
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{aggregatedStats.totalActiveUsers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last {timeframe} days
            </p>
          </div>

          {/* Acceptance Rate Card */}
          <div className="bg-white dark:bg-dark-bgSecondary rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Acceptance Rate</h3>
              {getTrendIcon(aggregatedStats.avgAcceptanceRate, 50)}
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {aggregatedStats.avgAcceptanceRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {aggregatedStats.totalAcceptances.toLocaleString()} / {aggregatedStats.totalSuggestions.toLocaleString()} suggestions
            </p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Total Suggestions</h3>
            <p className="text-4xl font-bold">{aggregatedStats.totalSuggestions.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">Code suggestions generated</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Total Acceptances</h3>
            <p className="text-4xl font-bold">{aggregatedStats.totalAcceptances.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">Suggestions accepted by developers</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-90 mb-2">Avg Acceptances Per User</h3>
            <p className="text-4xl font-bold">{aggregatedStats.avgAcceptancesPerUser.toFixed(0)}</p>
            <p className="text-xs opacity-75 mt-1">Per active user</p>
          </div>
        </div>

        {/* Individual Member Statistics Table */}
        <div className="bg-white dark:bg-dark-bgSecondary rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                Individual Member Statistics
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bgTertiary text-gray-900 dark:text-dark-text text-sm w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-bgTertiary">
                <tr>
                  <th 
                    onClick={() => handleSort('username')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  >
                    <div className="flex items-center gap-2">
                      Username
                      {sortField === 'username' && (
                        <span className="text-purple-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Copilot Seat
                  </th>
                  <th 
                    onClick={() => handleSort('suggestions')}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Suggestions
                      {sortField === 'suggestions' && (
                        <span className="text-purple-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('acceptances')}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Acceptances
                      {sortField === 'acceptances' && (
                        <span className="text-purple-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('acceptanceRate')}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Acceptance Rate %
                      {sortField === 'acceptanceRate' && (
                        <span className="text-purple-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('activeDays')}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Active Days
                      {sortField === 'activeDays' && (
                        <span className="text-purple-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredAndSortedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No member data available. Please select teams and ensure Copilot usage data is imported.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedMembers.map((member) => (
                    <tr key={member.username} className="hover:bg-gray-50 dark:hover:bg-dark-bgTertiary transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {member.hasCopilotSeat ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-dark-text">
                        {member.suggestions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-dark-text">
                        {member.acceptances.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.acceptanceRate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          member.acceptanceRate >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {member.acceptanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-dark-text">
                        {member.activeDays}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredAndSortedMembers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredAndSortedMembers.length} member(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
