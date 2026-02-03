import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserDetails } from '@/hooks/useUsageData';
import { Timeframe } from '@/types';
import { ChevronLeft, ChevronRight, Loader2, Search, Filter } from 'lucide-react';

type InteractionMode = 'all' | 'chat' | 'agent';
type IDEFilter = 'all' | 'vscode' | 'visualstudio' | 'intellij' | 'eclipse' | 'xcode';
type SortOrder = 'none' | 'asc' | 'desc';

function formatDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
  
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function TableViewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeframe, setTimeframe] = useState<Timeframe>('7');
  const [page, setPage] = useState(1);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [limit, setLimit] = useState(25);
  
  // Filter states
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('all');
  const [ideFilter, setIDEFilter] = useState<IDEFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Sync with URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setSearchInput(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  // Fetch more data to allow client-side filtering
  const { data, isLoading, error } = useUserDetails(timeframe, 1, 1000, searchQuery);

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: '7', label: `Last 7 days (${formatDateRange(7)})` },
    { value: '14', label: `Last 14 days (${formatDateRange(14)})` },
    { value: '28', label: `Last 28 days (${formatDateRange(28)})` },
    { value: '90', label: `Last 3 months (${formatDateRange(90)})` },
  ];

  const interactionModeOptions = [
    { value: 'all', label: 'All Modes' },
    { value: 'chat', label: 'Ask (Chat)' },
    { value: 'agent', label: 'Agent' },
  ];

  const ideOptions = [
    { value: 'all', label: 'All IDEs' },
    { value: 'vscode', label: 'VS Code' },
    { value: 'visualstudio', label: 'Visual Studio' },
    { value: 'intellij', label: 'IntelliJ' },
    { value: 'eclipse', label: 'Eclipse' },
    { value: 'xcode', label: 'Xcode' },
  ];

  const sortOptions = [
    { value: 'none', label: 'No Sorting' },
    { value: 'asc', label: 'Acceptances (Low → High)' },
    { value: 'desc', label: 'Acceptances (High → Low)' },
  ];

  const limitOptions = [25, 50, 75, 100];

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    let result = [...data.data];
    
    // Filter by interaction mode
    if (interactionMode === 'chat') {
      result = result.filter(row => Boolean(row.used_chat));
    } else if (interactionMode === 'agent') {
      result = result.filter(row => Boolean(row.used_agent));
    }
    
    // Filter by IDE
    if (ideFilter !== 'all') {
      result = result.filter(row => {
        const ide = (row.primary_ide || '').toLowerCase();
        switch (ideFilter) {
          case 'vscode':
            return ide.includes('vscode') || ide.includes('visual studio code');
          case 'visualstudio':
            // Match 'visualstudio' (no space) or 'visual studio' (with space), but exclude 'code'
            return (ide === 'visualstudio' || (ide.includes('visual studio') && !ide.includes('code')));
          case 'intellij':
            return ide.includes('intellij');
          case 'eclipse':
            return ide.includes('eclipse');
          case 'xcode':
            return ide.includes('xcode');
          default:
            return true;
        }
      });
    }
    
    // Sort by acceptance count
    if (sortOrder !== 'none') {
      result.sort((a, b) => {
        const countA = Number(a.code_acceptance_activity_count) || 0;
        const countB = Number(b.code_acceptance_activity_count) || 0;
        if (sortOrder === 'asc') {
          return countA - countB;
        } else {
          return countB - countA;
        }
      });
    }
    
    return result;
  }, [data, interactionMode, ideFilter, sortOrder]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  const totalPages = Math.ceil(filteredData.length / limit);

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

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              Detailed Report
            </h1>
            <select
              value={timeframe}
              onChange={(e) => {
                setTimeframe(e.target.value as Timeframe);
                setPage(1);
              }}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by user, enterprise ID, or user ID..."
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

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bgSecondary rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-dark-textSecondary" />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Filters:</span>
            </div>
            
            {/* Interaction Mode */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Mode:</label>
              <select
                value={interactionMode}
                onChange={(e) => { setInteractionMode(e.target.value as InteractionMode); handleFilterChange(); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {interactionModeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* IDE Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">IDE:</label>
              <select
                value={ideFilter}
                onChange={(e) => { setIDEFilter(e.target.value as IDEFilter); handleFilterChange(); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ideOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as SortOrder); handleFilterChange(); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Rows Per Page */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Per page:</label>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            {searchQuery ? (
              <span>Found {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} matching "{searchQuery}"</span>
            ) : (
              <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, filteredData.length)} of {filteredData.length} records {filteredData.length !== data.total && `(filtered from ${data.total})`}</span>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Report Start
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Report End
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Enterprise ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    User Login
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Interactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Code Gen
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Acceptances
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Chat
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    LOC Sugg+
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    LOC Sugg-
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    LOC Added
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    LOC Deleted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    IDE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    IDE Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-textSecondary uppercase tracking-wider whitespace-nowrap">
                    Plugin Version
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-dark-border">
                {paginatedData.map((row, idx) => (
                  <tr 
                    key={`${row.user_id}-${row.day}-${idx}`}
                    className="hover:bg-gray-50 dark:hover:bg-dark-bgSecondary transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {row.report_start_day}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {row.report_end_day}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {row.day}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono text-xs">
                      {row.enterprise_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono text-xs">
                      {row.user_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap font-medium">
                      {row.user_login}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {row.user_initiated_interaction_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {row.code_generation_activity_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap text-right tabular-nums">
                      {row.code_acceptance_activity_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                        row.used_agent 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                      }`}>
                        {row.used_agent ? (
                          <>
                            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                              row.used_agent
                                ? 'bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                              ✓
                            </span>
                            <span>{`{${row.code_generation_activity_count.toLocaleString()}}`}</span>
                          </>
                        ) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                        row.used_chat 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                      }`}>
                        {row.used_chat ? (
                          <>
                            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                              row.used_chat
                                ? 'bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                              ✓
                            </span>
                            <span>{`{${row.user_initiated_interaction_count.toLocaleString()}}`}</span>
                          </>
                        ) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 whitespace-nowrap text-right tabular-nums">
                      +{row.loc_suggested_to_add_sum.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 whitespace-nowrap text-right tabular-nums">
                      -{row.loc_suggested_to_delete_sum.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 whitespace-nowrap text-right tabular-nums">
                      +{row.loc_added_sum.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 whitespace-nowrap text-right tabular-nums">
                      -{row.loc_deleted_sum.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text whitespace-nowrap">
                      {row.primary_ide || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono text-xs">
                      {row.primary_ide_version || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-textSecondary whitespace-nowrap font-mono text-xs">
                      {row.primary_plugin_version || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
