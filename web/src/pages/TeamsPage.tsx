import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users2, Search, Upload, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  organization: string;
}

export function TeamsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeams.length / limit);
  const paginatedTeams = filteredTeams.slice((page - 1) * limit, page * limit);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Process imported teams data
      if (Array.isArray(data)) {
        const importedTeams: Team[] = data.map((item, idx) => ({
          id: item.id || `team-${idx}`,
          name: item.name || item.team_name || `Team ${idx + 1}`,
          description: item.description || '',
          memberCount: item.member_count || item.memberCount || 0,
          organization: item.organization || item.org || ''
        }));
        setTeams(importedTeams);
      }
    } catch (error) {
      console.error('Failed to import teams:', error);
      alert('Failed to import teams. Please ensure the file is valid JSON.');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users2 className="w-6 h-6 text-purple-500" />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                Teams
              </h1>
            </div>
            
            {/* Import Button */}
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import Teams
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
          
          <hr className="border-gray-200 dark:border-dark-border mb-3" />
          
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
            Teams are groups of users that are members of a specific group with cascading access and permissions.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Find a team..."
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
        {teams.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredTeams.length)} of {filteredTeams.length} teams</span>
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
        {teams.length > 0 && !isLoading && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bgSecondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap w-12">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {paginatedTeams.map((team, idx) => (
                  <tr 
                    key={team.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-400 dark:text-dark-textSecondary whitespace-nowrap">
                      {((page - 1) * limit) + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary max-w-xs truncate">
                      {team.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap">
                      {team.organization || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {team.memberCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {teams.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500 dark:text-dark-textSecondary border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg">
            <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No teams imported yet.</p>
            <p className="text-sm mb-4">Import a JSON file with your teams data to get started.</p>
            <button
              onClick={handleImportClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import Teams
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredTeams.length > limit && (
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
