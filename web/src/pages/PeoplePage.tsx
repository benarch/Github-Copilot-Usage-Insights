import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUsersList } from '@/hooks/useUsageData';
import { ChevronLeft, ChevronRight, Loader2, Users, Search } from 'lucide-react';
import { useImportData } from '@/contexts/ImportDataContext';

export function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const { users: importedUsers, getUserTeamInfo } = useImportData();
  const limit = 25;

  // Create maps for correlation by login and by id
  const userTeamsMapByLogin = new Map(
    importedUsers.map(u => [u.login.toLowerCase(), { teams: u.teams, team_count: u.team_count }])
  );
  const userTeamsMapById = new Map(
    importedUsers.map(u => [String(u.id), { teams: u.teams, team_count: u.team_count }])
  );
  
  // Helper to get team info by login or id
  const getTeamInfoForUser = (userLogin: string, userId: number) => {
    return userTeamsMapByLogin.get(userLogin.toLowerCase()) || 
           userTeamsMapById.get(String(userId)) || 
           null;
  };

  // Sync with URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setSearchInput(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useUsersList(page, limit, searchQuery);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setSearchParams(searchInput ? { search: searchInput } : {});
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              People
            </h1>
          </div>
          
          <hr className="border-gray-200 dark:border-dark-border mb-3" />
          
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
            People are users and team members that reflect your company Copilot users, or groups with cascading access permissions to GitHub Copilot.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Find a member..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
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
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {data.total} {data.total === 1 ? 'member' : 'members'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, data.total)} of {data.total} users</span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            Failed to load data. Please try again.
          </div>
        )}

        {/* Table */}
        {data && !isLoading && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bgSecondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap w-12">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Enterprise ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    User Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Team Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Team Membership
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    IDE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    IDE Version
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {data.data.map((user, idx) => {
                  const teamInfo = getTeamInfoForUser(user.user_login, user.user_id);
                  return (
                  <tr 
                    key={`${user.user_id}-${idx}`}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-400 dark:text-dark-textSecondary whitespace-nowrap">
                      {((page - 1) * limit) + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono">
                      {user.enterprise_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono">
                      {user.user_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      {user.user_login}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-center">
                      {teamInfo?.team_count ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {teamInfo?.teams?.length ? (
                          teamInfo.teams.map((team, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              {team}
                            </span>
                          ))
                        ) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {user.primary_ide || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono text-xs">
                      {user.primary_ide_version || '—'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500 dark:text-dark-textSecondary">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found. Upload a JSON file to get started.</p>
          </div>
        )}

        {/* Pagination */}
        {data && totalPages > 1 && (
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
