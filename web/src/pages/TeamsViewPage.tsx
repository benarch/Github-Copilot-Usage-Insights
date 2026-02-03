import { useState, useMemo } from 'react';
import { useUserDetails } from '@/hooks/useUsageData';
import { useImportData } from '@/contexts/ImportDataContext';
import { Timeframe } from '@/types';
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, Users2 } from 'lucide-react';

type SortOrder = 'none' | 'asc' | 'desc';

interface TeamAggregatedData {
  teamName: string;
  organization: string;
  memberCount: number;
  members: string[];
  totalInteractions: number;
  totalCodeGen: number;
  totalAcceptances: number;
  usedAgent: number;
  usedChat: number;
  locSuggestedToAdd: number;
  locSuggestedToDelete: number;
  locAdded: number;
  locDeleted: number;
}

function formatDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function TeamsViewPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(25);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { teams: importedTeams, users: importedUsers } = useImportData();

  const userToTeamsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    importedUsers.forEach(user => {
      map.set(user.login.toLowerCase(), user.teams);
      map.set(String(user.id), user.teams);
    });
    return map;
  }, [importedUsers]);

  const { data, isLoading, error } = useUserDetails(timeframe, 1, 1000, '');

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: '7', label: `Last 7 days (${formatDateRange(7)})` },
    { value: '14', label: `Last 14 days (${formatDateRange(14)})` },
    { value: '28', label: `Last 28 days (${formatDateRange(28)})` },
  ];

  const sortOptions = [
    { value: 'none', label: 'No Sorting' },
    { value: 'asc', label: 'Acceptances (Low to High)' },
    { value: 'desc', label: 'Acceptances (High to Low)' },
  ];

  const limitOptions = [25, 50, 75, 100];

  const teamsAggregatedData = useMemo(() => {
    if (!data?.data || importedTeams.length === 0) return [];
    const teamDataMap = new Map<string, TeamAggregatedData>();

    importedTeams.forEach(team => {
      const fullTeamName = team.organization ? `${team.organization}/${team.name}` : team.name;
      teamDataMap.set(fullTeamName, {
        teamName: team.name,
        organization: team.organization,
        memberCount: team.memberCount,
        members: team.members,
        totalInteractions: 0,
        totalCodeGen: 0,
        totalAcceptances: 0,
        usedAgent: 0,
        usedChat: 0,
        locSuggestedToAdd: 0,
        locSuggestedToDelete: 0,
        locAdded: 0,
        locDeleted: 0,
      });
    });

    data.data.forEach(row => {
      const userLogin = row.user_login.toLowerCase();
      const userId = String(row.user_id);
      const userTeams = userToTeamsMap.get(userLogin) || userToTeamsMap.get(userId) || [];

      userTeams.forEach(teamFullName => {
        const teamData = teamDataMap.get(teamFullName);
        if (teamData) {
          teamData.totalInteractions += Number(row.user_initiated_interaction_count) || 0;
          teamData.totalCodeGen += Number(row.code_generation_activity_count) || 0;
          teamData.totalAcceptances += Number(row.code_acceptance_activity_count) || 0;
          teamData.usedAgent += row.used_agent ? 1 : 0;
          teamData.usedChat += row.used_chat ? 1 : 0;
          teamData.locSuggestedToAdd += Number(row.loc_suggested_to_add_sum) || 0;
          teamData.locSuggestedToDelete += Number(row.loc_suggested_to_delete_sum) || 0;
          teamData.locAdded += Number(row.loc_added_sum) || 0;
          teamData.locDeleted += Number(row.loc_deleted_sum) || 0;
        }
      });
    });

    return Array.from(teamDataMap.values());
  }, [data, importedTeams, userToTeamsMap]);

  const filteredData = useMemo(() => {
    let result = [...teamsAggregatedData];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(team =>
        team.teamName.toLowerCase().includes(query) ||
        team.organization.toLowerCase().includes(query) ||
        team.members.some(m => m.toLowerCase().includes(query))
      );
    }
    if (sortOrder !== 'none') {
      result.sort((a, b) => sortOrder === 'asc' ? a.totalAcceptances - b.totalAcceptances : b.totalAcceptances - a.totalAcceptances);
    }
    return result;
  }, [teamsAggregatedData, searchQuery, sortOrder]);

  const paginatedData = useMemo(() => filteredData.slice((page - 1) * limit, page * limit), [filteredData, page, limit]);
  const totalPages = Math.ceil(filteredData.length / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users2 className="w-6 h-6 text-purple-500" />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">Teams View</h1>
            </div>
            <select
              value={timeframe}
              onChange={(e) => { setTimeframe(e.target.value as Timeframe); setPage(1); }}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
            Aggregated Copilot usage metrics at the team level. Data is combined from all team members.
          </p>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by team name, organization, or member..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-200 dark:bg-dark-bgTertiary text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-300 dark:hover:bg-dark-border transition-colors"
              >
                Clear
              </button>
            )}
          </form>
          <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bgSecondary rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-dark-textSecondary" />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Options:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Per page:</label>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {importedTeams.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500 dark:text-dark-textSecondary border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg">
            <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No team data available.</p>
            <p className="text-sm">Import user data with team assignments from the Teams page to see aggregated team metrics.</p>
          </div>
        )}

        {importedTeams.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {filteredData.length} {filteredData.length === 1 ? 'team' : 'teams'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredData.length)} of {filteredData.length} teams</span>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            Failed to load data. Please try again.
          </div>
        )}

        {importedTeams.length > 0 && !isLoading && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bgSecondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Team Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Organization</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Members</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Interactions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Code Gen</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Acceptances</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Agent Uses</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">Chat Uses</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">LOC Sugg+</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">LOC Sugg-</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">LOC Added</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">LOC Deleted</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {paginatedData.map((team, idx) => (
                  <tr
                    key={`${team.organization}-${team.teamName}-${idx}`}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-400 dark:text-dark-textSecondary whitespace-nowrap">
                      {((page - 1) * limit) + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {team.teamName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {team.organization ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          {team.organization}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {team.memberCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {team.totalInteractions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {team.totalCodeGen.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums font-medium">
                      {team.totalAcceptances.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {team.usedAgent}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {team.usedChat}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 whitespace-nowrap text-right tabular-nums">
                      +{team.locSuggestedToAdd.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 whitespace-nowrap text-right tabular-nums">
                      -{team.locSuggestedToDelete.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 whitespace-nowrap text-right tabular-nums">
                      +{team.locAdded.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 whitespace-nowrap text-right tabular-nums">
                      -{team.locDeleted.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {importedTeams.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-dark-textSecondary">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bgTertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bgTertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
