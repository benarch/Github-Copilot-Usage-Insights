import { useState } from 'react';
import { useUserDetails } from '@/hooks/useUsageData';
import { Timeframe } from '@/types';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function TableViewPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7');
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading, error } = useUserDetails(timeframe, page, limit);

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: '7', label: 'Last 7 days' },
    { value: '14', label: 'Last 14 days' },
    { value: '28', label: 'Last 28 days' },
  ];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
            User Usage Details
          </h1>
          <div className="flex items-center gap-4">
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
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="mb-4 text-sm text-gray-600 dark:text-dark-textSecondary">
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, data.total)} of {data.total} records
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
                {data.data.map((row, idx) => (
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
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                        row.used_agent 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                      }`}>
                        {row.used_agent ? '✓' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                        row.used_chat 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                      }`}>
                        {row.used_chat ? '✓' : '—'}
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
