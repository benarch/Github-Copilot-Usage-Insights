import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImportData } from '@/contexts/ImportDataContext';

export function OrganizationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const { organizations } = useImportData();
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

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrganizations.length / limit);
  const paginatedOrganizations = filteredOrganizations.slice((page - 1) * limit, page * limit);

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
            <Building2 className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              Organizations
            </h1>
          </div>
          
          <hr className="border-gray-200 dark:border-dark-border mb-3" />
          
          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
            Organizations are entities that contain teams and users with shared access to repositories and Copilot licenses.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Find an organization..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
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
        {organizations.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {filteredOrganizations.length} {filteredOrganizations.length === 1 ? 'organization' : 'organizations'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredOrganizations.length)} of {filteredOrganizations.length} organizations</span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Table */}
        {organizations.length > 0 && !isLoading && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-bgSecondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap w-12">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Organization Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {paginatedOrganizations.map((org, idx) => (
                  <tr 
                    key={org.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-400 dark:text-dark-textSecondary whitespace-nowrap">
                      {((page - 1) * limit) + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {org.teamsCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {org.memberCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {organizations.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500 dark:text-dark-textSecondary border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No organizations found.</p>
            <p className="text-sm">Import user data from the Teams page to populate organizations.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrganizations.length > limit && (
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
