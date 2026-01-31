import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImportData } from '@/contexts/ImportDataContext';

export function UsersInTeamsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const { users } = useImportData();
  const [isLoading] = useState(false);
  const limit = 25;

  // Sync with URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setSearchInput(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.teams.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.organizations.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

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
            <User className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              Users in Teams
            </h1>
          </div>
          
          <hr className="border-gray-200 dark:border-dark-border mb-3" />
          
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
            All users from the imported data with their team and organization memberships.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Find a user..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
        {users.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredUsers.length)} of {filteredUsers.length} users</span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Table */}
        {users.length > 0 && !isLoading && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bgSecondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap w-12">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Organizations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Org Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Team Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {paginatedUsers.map((user, idx) => (
                  <tr 
                    key={user.id || idx}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-400 dark:text-dark-textSecondary whitespace-nowrap">
                      {((page - 1) * limit) + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      {user.login}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {user.organizations.length > 0 ? user.organizations.map((org, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {org}
                          </span>
                        )) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-center">
                      {user.organization_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {user.teams.length > 0 ? user.teams.map((team, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            {team}
                          </span>
                        )) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-center">
                      {user.team_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {users.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500 dark:text-dark-textSecondary border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No users found.</p>
            <p className="text-sm">Import user data from the Teams page to see users here.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > limit && (
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
