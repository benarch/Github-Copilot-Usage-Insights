/**
 * GitHub Sync Service
 * 
 * Handles syncing data from GitHub Copilot Metrics API to the local database
 */

import { getDatabase } from '../models/database.js';
import { GitHubApiClient, CopilotUsageMetrics } from './githubApiClient.js';

// Constants for aggregate data representation
// These special values are used to store aggregated organization-level metrics from GitHub API
// which don't include per-user breakdowns like manual exports do
const AGGREGATE_ENTERPRISE_ID = 'github-api';
const AGGREGATE_USER_ID = 0;
const AGGREGATE_USER_LOGIN = '_aggregate';

export interface SyncResult {
  success: boolean;
  message: string;
  recordsSynced?: number;
  errors?: string[];
}

export interface SyncOptions {
  since?: string;
  until?: string;
  clearExisting?: boolean;
}

/**
 * Transform GitHub API metrics to match our database format
 * Note: GitHub API returns aggregated data, not per-user data like the export
 */
function transformGitHubMetricsToUserUsage(metrics: CopilotUsageMetrics): any[] {
  // GitHub API returns aggregated data, we'll store it as a special "aggregate" user
  // This is a simplified approach - ideally we'd fetch per-seat metrics if available
  
  const userUsageRecords: any[] = [];
  
  // Create a synthetic aggregate user record using constants
  const baseRecord = {
    day: metrics.day,
    report_start_day: metrics.day,
    report_end_day: metrics.day,
    enterprise_id: AGGREGATE_ENTERPRISE_ID,
    user_id: AGGREGATE_USER_ID,
    user_login: AGGREGATE_USER_LOGIN,
    user_initiated_interaction_count: metrics.total_active_users,
    code_generation_activity_count: metrics.total_suggestions_count,
    code_acceptance_activity_count: metrics.total_acceptances_count,
    used_agent: 0,
    used_chat: metrics.total_active_chat_users > 0 ? 1 : 0,
    loc_suggested_to_add_sum: metrics.total_lines_suggested,
    loc_suggested_to_delete_sum: 0,
    loc_added_sum: metrics.total_lines_accepted,
    loc_deleted_sum: 0,
    primary_ide: null,
    primary_ide_version: null,
    primary_plugin_version: null,
  };

  userUsageRecords.push(baseRecord);

  return userUsageRecords;
}

/**
 * Store GitHub metrics in the database
 */
function storeMetricsInDatabase(metrics: CopilotUsageMetrics[]): number {
  const db = getDatabase();
  let recordCount = 0;

  const insertUserUsageStmt = db.prepare(`
    INSERT OR REPLACE INTO user_usage_details (
      report_start_day, report_end_day, day, enterprise_id, user_id, user_login,
      user_initiated_interaction_count, code_generation_activity_count,
      code_acceptance_activity_count, used_agent, used_chat,
      loc_suggested_to_add_sum, loc_suggested_to_delete_sum,
      loc_added_sum, loc_deleted_sum,
      primary_ide, primary_ide_version, primary_plugin_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDailyUsageStmt = db.prepare(`
    INSERT OR REPLACE INTO daily_usage (
      date, active_users, total_suggestions, accepted_suggestions, chat_requests
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((allMetrics: CopilotUsageMetrics[]) => {
    for (const metric of allMetrics) {
      // Store aggregate daily usage
      insertDailyUsageStmt.run(
        metric.day,
        metric.total_active_users,
        metric.total_suggestions_count,
        metric.total_acceptances_count,
        metric.total_chat_turns
      );

      // Store user usage details (transformed)
      const userRecords = transformGitHubMetricsToUserUsage(metric);
      for (const record of userRecords) {
        insertUserUsageStmt.run(
          record.report_start_day,
          record.report_end_day,
          record.day,
          record.enterprise_id,
          record.user_id,
          record.user_login,
          record.user_initiated_interaction_count,
          record.code_generation_activity_count,
          record.code_acceptance_activity_count,
          record.used_agent,
          record.used_chat,
          record.loc_suggested_to_add_sum,
          record.loc_suggested_to_delete_sum,
          record.loc_added_sum,
          record.loc_deleted_sum,
          record.primary_ide,
          record.primary_ide_version,
          record.primary_plugin_version
        );
        recordCount++;
      }
    }
  });

  transaction(metrics);
  return recordCount;
}

/**
 * Sync data from GitHub API to the database
 */
export async function syncFromGitHub(
  client: GitHubApiClient,
  options: SyncOptions = {}
): Promise<SyncResult> {
  try {
    // Test connection first
    const connectionOk = await client.testConnection();
    if (!connectionOk) {
      return {
        success: false,
        message: 'Failed to connect to GitHub API. Please check your token and organization name.',
      };
    }

    // Clear existing data if requested
    if (options.clearExisting) {
      const db = getDatabase();
      // Only clear data from GitHub API source to avoid deleting manual imports
      db.exec(`DELETE FROM user_usage_details WHERE enterprise_id = '${AGGREGATE_ENTERPRISE_ID}'`);
      db.exec(`DELETE FROM daily_usage WHERE date IN (
        SELECT DISTINCT day FROM user_usage_details WHERE enterprise_id = '${AGGREGATE_ENTERPRISE_ID}'
      )`);
    }

    // Fetch metrics from GitHub
    const metrics = await client.fetchAllCopilotUsageMetrics(options.since, options.until);

    if (metrics.length === 0) {
      return {
        success: true,
        message: 'No new metrics found to sync.',
        recordsSynced: 0,
      };
    }

    // Store in database
    const recordCount = storeMetricsInDatabase(metrics);

    return {
      success: true,
      message: `Successfully synced ${metrics.length} days of metrics (${recordCount} records).`,
      recordsSynced: recordCount,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred during sync',
      errors: [error instanceof Error ? error.stack || error.message : 'Unknown error'],
    };
  }
}

/**
 * Get the last sync date from the database
 */
export function getLastSyncDate(): string | null {
  const db = getDatabase();
  
  const row = db.prepare(`
    SELECT MAX(day) as last_sync_day
    FROM user_usage_details
    WHERE enterprise_id = ?
  `).get(AGGREGATE_ENTERPRISE_ID) as { last_sync_day: string | null };

  return row?.last_sync_day || null;
}
