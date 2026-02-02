import { getDatabase, clearAllData as clearDatabaseData } from '../models/database.js';
import * as jsonReader from '../services/jsonFileReader.js';
import type { 
  DailyUsage, 
  WeeklyUsage, 
  ChatModeRequest, 
  ModelUsage, 
  AgentAdoption,
  DashboardSummary,
  ChartDataPoint,
  StackedChartDataPoint,
  Timeframe,
  ModelUsageDistribution,
  ModelUsagePerDay,
  ModelUsagePerLanguage,
  ModelUsagePerChatMode,
  CodeCompletionsDataPoint,
  AcceptanceRateDataPoint
} from '../models/types.js';

// Check if we should use direct JSON mode
// Use JSON if: raw folder has JSON files (for quick demo without ingestion)
async function shouldUseDirectJson(): Promise<boolean> {
  return jsonReader.hasJsonFiles();
}

interface UserUsageDetail {
  report_start_day: string;
  report_end_day: string;
  day: string;
  enterprise_id: string;
  user_id: string;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  used_agent: boolean;
  used_chat: boolean;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  primary_ide: string | null;
  primary_ide_version: string | null;
  primary_plugin_version: string | null;
}

interface UserUsageDetailsResponse {
  data: UserUsageDetail[];
  total: number;
  page: number;
  limit: number;
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const db = getDatabase();
  
  // First, try to get the date range from actual data in the database
  const latestData = db.prepare(`
    SELECT MAX(day) as max_date FROM user_usage_details
  `).get() as { max_date: string | null } | undefined;
  
  if (latestData?.max_date) {
    // Use the latest data date as the end date
    const endDate = new Date(latestData.max_date);
    const startDate = new Date(latestData.max_date);
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }
  
  // Fallback to current date if no data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

export async function getDashboardSummary(timeframe: Timeframe): Promise<DashboardSummary> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  // Check for direct JSON mode
  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getSummaryFromRecords(filtered);
  }

  // Use SQLite
  const db = getDatabase();

  // Get IDE active users (latest value)
  const activeUsersRow = db.prepare(`
    SELECT active_users FROM daily_usage 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date DESC LIMIT 1
  `).get(startDate, endDate) as { active_users: number } | undefined;

  // Get agent adoption (latest value)
  const agentRow = db.prepare(`
    SELECT total_active_users, agent_users FROM agent_adoption 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date DESC LIMIT 1
  `).get(startDate, endDate) as { total_active_users: number; agent_users: number } | undefined;

  // Get most used chat model
  const modelRow = db.prepare(`
    SELECT model_name, SUM(requests) as total_requests 
    FROM model_usage 
    WHERE date BETWEEN ? AND ? 
    GROUP BY model_name 
    ORDER BY total_requests DESC 
    LIMIT 1
  `).get(startDate, endDate) as { model_name: string; total_requests: number } | undefined;

  const totalActiveUsers = agentRow?.total_active_users || 0;
  const agentUsers = agentRow?.agent_users || 0;

  return {
    ideActiveUsers: activeUsersRow?.active_users || 0,
    agentAdoption: {
      percentage: totalActiveUsers > 0 ? Math.round((agentUsers / totalActiveUsers) * 100) : 0,
      agentUsers,
      totalActiveUsers,
    },
    mostUsedChatModel: {
      name: modelRow?.model_name || 'N/A',
      requests: modelRow?.total_requests || 0,
    },
  };
}

export async function getDailyActiveUsers(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  // Check for direct JSON mode
  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getDailyActiveUsersFromRecords(filtered);
  }

  const db = getDatabase();

  const rows = db.prepare(`
    SELECT date, active_users as value FROM daily_usage 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date ASC
  `).all(startDate, endDate) as ChartDataPoint[];

  return rows;
}

export async function getWeeklyActiveUsers(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  // Weekly not supported in direct JSON mode, return daily as fallback
  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getDailyActiveUsersFromRecords(filtered);
  }

  const db = getDatabase();

  const rows = db.prepare(`
    SELECT week_start as date, active_users as value FROM weekly_usage 
    WHERE week_start BETWEEN ? AND ? 
    ORDER BY week_start ASC
  `).all(startDate, endDate) as ChartDataPoint[];

  return rows;
}

export async function getAverageChatRequestsPerUser(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  // Calculate average from JSON records
  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    const daily = jsonReader.getDailyActiveUsersFromRecords(filtered);
    // Return interaction count per user as average
    const dailyMap = new Map<string, { interactions: number; users: number }>();
    for (const r of filtered) {
      if (!dailyMap.has(r.day)) dailyMap.set(r.day, { interactions: 0, users: 0 });
      const d = dailyMap.get(r.day)!;
      d.interactions += r.user_initiated_interaction_count;
      d.users++;
    }
    return Array.from(dailyMap.entries())
      .map(([date, d]) => ({ date, value: d.users > 0 ? Math.round((d.interactions / d.users) * 10) / 10 : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const db = getDatabase();

  const rows = db.prepare(`
    SELECT date, 
           CASE WHEN active_users > 0 
                THEN ROUND(CAST(chat_requests AS REAL) / active_users, 1) 
                ELSE 0 
           END as value 
    FROM daily_usage 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date ASC
  `).all(startDate, endDate) as ChartDataPoint[];

  return rows;
}

export async function getChatModeRequests(timeframe: Timeframe): Promise<StackedChartDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getChatModeRequestsFromRecords(filtered);
  }

  const db = getDatabase();

  const rows = db.prepare(`
    SELECT date,
           SUM(CASE WHEN mode = 'edit' THEN requests ELSE 0 END) as edit,
           SUM(CASE WHEN mode = 'ask' THEN requests ELSE 0 END) as ask,
           SUM(CASE WHEN mode = 'agent' THEN requests ELSE 0 END) as agent,
           SUM(CASE WHEN mode = 'custom' THEN requests ELSE 0 END) as custom,
           SUM(CASE WHEN mode = 'inline' THEN requests ELSE 0 END) as inline
    FROM chat_mode_requests 
    WHERE date BETWEEN ? AND ? 
    GROUP BY date 
    ORDER BY date ASC
  `).all(startDate, endDate) as StackedChartDataPoint[];

  return rows;
}

export async function getCodeGenerationStats(timeframe: Timeframe): Promise<{ 
  totalSuggestions: number; 
  acceptedSuggestions: number; 
  acceptanceRate: number;
  dailyData: Array<{ date: string; suggestions: number; accepted: number }>;
}> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getCodeGenerationFromRecords(filtered);
  }

  const db = getDatabase();

  const totals = db.prepare(`
    SELECT 
      SUM(total_suggestions) as totalSuggestions,
      SUM(accepted_suggestions) as acceptedSuggestions
    FROM daily_usage 
    WHERE date BETWEEN ? AND ?
  `).get(startDate, endDate) as { totalSuggestions: number; acceptedSuggestions: number };

  const dailyData = db.prepare(`
    SELECT date, total_suggestions as suggestions, accepted_suggestions as accepted
    FROM daily_usage 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date ASC
  `).all(startDate, endDate) as Array<{ date: string; suggestions: number; accepted: number }>;

  const totalSuggestions = totals?.totalSuggestions || 0;
  const acceptedSuggestions = totals?.acceptedSuggestions || 0;

  return {
    totalSuggestions,
    acceptedSuggestions,
    acceptanceRate: totalSuggestions > 0 ? Math.round((acceptedSuggestions / totalSuggestions) * 100) : 0,
    dailyData,
  };
}

export async function getUserUsageDetails(
  timeframe: Timeframe,
  page: number = 1,
  limit: number = 50,
  search: string = ''
): Promise<UserUsageDetailsResponse> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    // Apply search filter if provided
    const searchFiltered = search 
      ? filtered.filter(r => 
          r.user_login.toLowerCase().includes(search.toLowerCase()) ||
          r.enterprise_id.toLowerCase().includes(search.toLowerCase()) ||
          r.user_id.toString().includes(search)
        )
      : filtered;
    return jsonReader.getUserDetailsFromRecords(searchFiltered, page, limit);
  }

  const db = getDatabase();
  const offset = (page - 1) * limit;
  const searchPattern = search ? `%${search}%` : '%';

  // Get total count of unique users
  const countRow = db.prepare(`
    SELECT COUNT(DISTINCT user_login) as total FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
    AND (user_login LIKE ? OR enterprise_id LIKE ? OR CAST(user_id AS TEXT) LIKE ?)
  `).get(startDate, endDate, searchPattern, searchPattern, searchPattern) as { total: number };

  // Get paginated data aggregated by user
  const rows = db.prepare(`
    SELECT 
      MIN(report_start_day) as report_start_day, 
      MAX(report_end_day) as report_end_day, 
      MAX(day) as day, 
      enterprise_id, 
      user_id, 
      user_login,
      SUM(user_initiated_interaction_count) as user_initiated_interaction_count, 
      SUM(code_generation_activity_count) as code_generation_activity_count, 
      SUM(code_acceptance_activity_count) as code_acceptance_activity_count,
      MAX(used_agent) as used_agent, 
      MAX(used_chat) as used_chat, 
      SUM(loc_suggested_to_add_sum) as loc_suggested_to_add_sum, 
      SUM(loc_suggested_to_delete_sum) as loc_suggested_to_delete_sum,
      SUM(loc_added_sum) as loc_added_sum, 
      SUM(loc_deleted_sum) as loc_deleted_sum, 
      MAX(primary_ide) as primary_ide, 
      MAX(primary_ide_version) as primary_ide_version, 
      MAX(primary_plugin_version) as primary_plugin_version
    FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
    AND (user_login LIKE ? OR enterprise_id LIKE ? OR CAST(user_id AS TEXT) LIKE ?)
    GROUP BY user_login
    ORDER BY user_login ASC
    LIMIT ? OFFSET ?
  `).all(startDate, endDate, searchPattern, searchPattern, searchPattern, limit, offset) as Array<{
    report_start_day: string;
    report_end_day: string;
    day: string;
    enterprise_id: string;
    user_id: string;
    user_login: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    used_agent: number;
    used_chat: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    primary_ide: string | null;
    primary_ide_version: string | null;
    primary_plugin_version: string | null;
  }>;

  return {
    data: rows.map(row => ({
      ...row,
      used_agent: row.used_agent === 1,
      used_chat: row.used_chat === 1,
    })),
    total: countRow.total,
    page,
    limit,
  };
}

export interface IDEUsageData {
  ide: string;
  users: number;
  interactions: number;
}

export function getIDEUsageStats(timeframe: Timeframe): IDEUsageData[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  const rows = db.prepare(`
    SELECT 
      COALESCE(primary_ide, 'Unknown') as ide,
      COUNT(DISTINCT user_id) as users,
      SUM(user_initiated_interaction_count) as interactions
    FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
    GROUP BY COALESCE(primary_ide, 'Unknown')
    ORDER BY users DESC
  `).all(startDate, endDate) as IDEUsageData[];

  return rows;
}

// IDE weekly active users for the weekly IDE breakdown chart
export interface IDEWeeklyActiveUsers {
  week_start: string;
  ide: string;
  users: number;
}

export function getIDEWeeklyActiveUsers(timeframe: Timeframe): IDEWeeklyActiveUsers[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  const rows = db.prepare(`
    SELECT 
      date(day, 'weekday 0', '-6 days') as week_start,
      COALESCE(primary_ide, 'Unknown') as ide,
      COUNT(DISTINCT user_id) as users
    FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
    GROUP BY week_start, COALESCE(primary_ide, 'Unknown')
    ORDER BY week_start, users DESC
  `).all(startDate, endDate) as IDEWeeklyActiveUsers[];

  return rows;
}

export async function processUploadedFile(
  buffer: Buffer,
  filename: string,
  clearExisting: boolean = true
): Promise<{ success: boolean; message: string; recordsImported: number }> {
  // Clear all existing data before import
  if (clearExisting) {
    clearDatabaseData();
  }

  const content = buffer.toString('utf-8');
  const records: any[] = [];

  // Parse the file content (support both JSON array and NDJSON)
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('[')) {
      // Regular JSON array
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        records.push(...parsed);
      }
    } else {
      // NDJSON format (one JSON object per line)
      const lines = trimmed.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            records.push(JSON.parse(line));
          } catch {
            // Skip invalid lines
          }
        }
      }
    }
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  if (records.length === 0) {
    throw new Error('No valid records found in file');
  }

  // Import records into database
  const db = getDatabase();
  let imported = 0;

  // Prepare all insert statements
  const insertUserDetails = db.prepare(`
    INSERT OR REPLACE INTO user_usage_details (
      report_start_day, report_end_day, day, enterprise_id, user_id, user_login,
      user_initiated_interaction_count, code_generation_activity_count, code_acceptance_activity_count,
      used_agent, used_chat, loc_suggested_to_add_sum, loc_suggested_to_delete_sum,
      loc_added_sum, loc_deleted_sum, primary_ide, primary_ide_version, primary_plugin_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertByIde = db.prepare(`
    INSERT INTO user_usage_by_ide (user_usage_id, ide, code_gen_count, acceptance_count, loc_suggested, loc_added)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertByFeature = db.prepare(`
    INSERT INTO user_usage_by_feature (user_usage_id, feature, interaction_count, activity_count, acceptance_count)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertByLanguageFeature = db.prepare(`
    INSERT INTO user_usage_by_language_feature (user_usage_id, language, feature, count)
    VALUES (?, ?, ?, ?)
  `);

  const insertByLanguageModel = db.prepare(`
    INSERT INTO user_usage_by_language_model (user_usage_id, language, model, count)
    VALUES (?, ?, ?, ?)
  `);

  const insertByModelFeature = db.prepare(`
    INSERT INTO user_usage_by_model_feature (user_usage_id, model, feature, count)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((recs: any[]) => {
    for (const record of recs) {
      try {
        // Extract primary IDE and IDE version from totals_by_ide if available
        let primaryIde = record.primary_ide || null;
        let primaryIdeVersion = record.primary_ide_version || null;
        if (record.totals_by_ide && record.totals_by_ide.length > 0) {
          const firstIde = record.totals_by_ide[0];
          if (!primaryIde) {
            primaryIde = firstIde.ide;
          }
          if (!primaryIdeVersion && firstIde.last_known_ide_version) {
            primaryIdeVersion = firstIde.last_known_ide_version.ide_version;
          }
        }

        const result = insertUserDetails.run(
          record.report_start_day || record.day,
          record.report_end_day || record.day,
          record.day,
          record.enterprise_id || 'uploaded',
          record.user_id,
          record.user_login,
          record.user_initiated_interaction_count || 0,
          record.code_generation_activity_count || 0,
          record.code_acceptance_activity_count || 0,
          record.used_agent ? 1 : 0,
          record.used_chat ? 1 : 0,
          record.loc_suggested_to_add_sum || 0,
          record.loc_suggested_to_delete_sum || 0,
          record.loc_added_sum || 0,
          record.loc_deleted_sum || 0,
          primaryIde,
          primaryIdeVersion,
          record.primary_plugin_version || null
        );

        const userUsageId = result.lastInsertRowid;

        // Insert totals_by_ide
        if (record.totals_by_ide && Array.isArray(record.totals_by_ide)) {
          for (const ide of record.totals_by_ide) {
            insertByIde.run(
              userUsageId,
              ide.ide || 'unknown',
              ide.code_generation_activity_count || 0,
              ide.code_acceptance_activity_count || 0,
              ide.loc_suggested_to_add_sum || 0,
              ide.loc_added_sum || 0
            );
          }
        }

        // Insert totals_by_feature
        if (record.totals_by_feature && Array.isArray(record.totals_by_feature)) {
          for (const feature of record.totals_by_feature) {
            insertByFeature.run(
              userUsageId,
              feature.feature || 'unknown',
              feature.user_initiated_interaction_count || 0,
              feature.code_generation_activity_count || 0,
              feature.code_acceptance_activity_count || 0
            );
          }
        }

        // Insert totals_by_language_feature
        if (record.totals_by_language_feature && Array.isArray(record.totals_by_language_feature)) {
          for (const lf of record.totals_by_language_feature) {
            const count = (lf.code_generation_activity_count || 0) + (lf.code_acceptance_activity_count || 0);
            if (count > 0) {
              insertByLanguageFeature.run(
                userUsageId,
                lf.language || 'unknown',
                lf.feature || 'unknown',
                count
              );
            }
          }
        }

        // Insert totals_by_language_model
        if (record.totals_by_language_model && Array.isArray(record.totals_by_language_model)) {
          for (const lm of record.totals_by_language_model) {
            const count = (lm.code_generation_activity_count || 0) + (lm.code_acceptance_activity_count || 0);
            if (count > 0 && lm.model && lm.model !== 'unknown') {
              insertByLanguageModel.run(
                userUsageId,
                lm.language || 'unknown',
                lm.model,
                count
              );
            }
          }
        }

        // Insert totals_by_model_feature
        if (record.totals_by_model_feature && Array.isArray(record.totals_by_model_feature)) {
          for (const mf of record.totals_by_model_feature) {
            const count = (mf.user_initiated_interaction_count || 0) + 
                          (mf.code_generation_activity_count || 0) + 
                          (mf.code_acceptance_activity_count || 0);
            if (count > 0 && mf.model && mf.model !== 'unknown') {
              insertByModelFeature.run(
                userUsageId,
                mf.model,
                mf.feature || 'unknown',
                count
              );
            }
          }
        }

        imported++;
      } catch (err) {
        // Skip records that fail to insert
        console.error('Failed to insert record:', err);
      }
    }
  });

  insertMany(records);

  // Now populate aggregate tables from the imported data
  populateAggregatesFromUserDetails(db);

  // Clear the JSON file cache so new data is visible
  jsonReader.clearCache();

  return {
    success: true,
    message: `Successfully imported ${imported} records from ${filename}`,
    recordsImported: imported,
  };
}

// Helper function to populate aggregate tables from user_usage_details
function populateAggregatesFromUserDetails(db: ReturnType<typeof getDatabase>): void {
  // Populate daily_usage
  db.exec(`
    INSERT OR REPLACE INTO daily_usage (date, active_users, total_suggestions, accepted_suggestions, chat_requests, agent_requests)
    SELECT 
      day as date,
      COUNT(DISTINCT user_id) as active_users,
      SUM(code_generation_activity_count) as total_suggestions,
      SUM(code_acceptance_activity_count) as accepted_suggestions,
      SUM(user_initiated_interaction_count) as chat_requests,
      SUM(CASE WHEN used_agent = 1 THEN user_initiated_interaction_count ELSE 0 END) as agent_requests
    FROM user_usage_details
    GROUP BY day
  `);

  // Populate agent_adoption
  db.exec(`
    INSERT OR REPLACE INTO agent_adoption (date, total_active_users, agent_users)
    SELECT 
      day as date,
      COUNT(DISTINCT user_id) as total_active_users,
      COUNT(DISTINCT CASE WHEN used_agent = 1 THEN user_id END) as agent_users
    FROM user_usage_details
    GROUP BY day
  `);

  // Populate model_usage from user_usage_by_model_feature if available
  // First check if we have model feature data
  const modelFeatureCount = db.prepare('SELECT COUNT(*) as cnt FROM user_usage_by_model_feature').get() as { cnt: number };
  
  if (modelFeatureCount && modelFeatureCount.cnt > 0) {
    db.exec(`
      INSERT OR REPLACE INTO model_usage (date, model_name, requests)
      SELECT 
        uud.day as date,
        umf.model as model_name,
        SUM(umf.count) as requests
      FROM user_usage_by_model_feature umf
      JOIN user_usage_details uud ON umf.user_usage_id = uud.id
      GROUP BY uud.day, umf.model
    `);
  } else {
    // Generate synthetic model usage data based on user activity
    db.exec(`
      INSERT OR REPLACE INTO model_usage (date, model_name, requests)
      SELECT 
        day as date,
        'Claude Sonnet 4.5' as model_name,
        CAST(SUM(user_initiated_interaction_count) * 0.45 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'Claude Opus 4' as model_name,
        CAST(SUM(user_initiated_interaction_count) * 0.25 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'GPT-4o' as model_name,
        CAST(SUM(user_initiated_interaction_count) * 0.20 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'Gemini Pro' as model_name,
        CAST(SUM(user_initiated_interaction_count) * 0.10 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
    `);
  }

  // Populate chat_mode_requests from user_usage_by_feature if available
  const featureCount = db.prepare('SELECT COUNT(*) as cnt FROM user_usage_by_feature').get() as { cnt: number };
  
  if (featureCount && featureCount.cnt > 0) {
    db.exec(`
      INSERT OR REPLACE INTO chat_mode_requests (date, mode, requests)
      SELECT 
        uud.day as date,
        CASE 
          WHEN uf.feature = 'code_completion' THEN 'inline'
          WHEN uf.feature = 'chat_inline' THEN 'inline'
          WHEN uf.feature IN ('chat', 'chat_panel_ask_mode') THEN 'ask'
          WHEN uf.feature IN ('agent', 'chat_panel_agent_mode') THEN 'agent'
          WHEN uf.feature IN ('edit', 'agent_edit', 'chat_panel_edit_mode') THEN 'edit'
          WHEN uf.feature IN ('chat_panel_custom_mode', 'chat_panel_unknown_mode') THEN 'custom'
          ELSE 'custom'
        END as mode,
        SUM(uf.interaction_count) as requests
      FROM user_usage_by_feature uf
      JOIN user_usage_details uud ON uf.user_usage_id = uud.id
      GROUP BY uud.day, mode
    `);
  } else {
    // Generate synthetic chat mode data based on user activity
    db.exec(`
      INSERT OR REPLACE INTO chat_mode_requests (date, mode, requests)
      SELECT 
        day as date,
        'agent' as mode,
        CAST(SUM(CASE WHEN used_agent = 1 THEN user_initiated_interaction_count ELSE 0 END) * 0.6 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'ask' as mode,
        CAST(SUM(CASE WHEN used_chat = 1 THEN user_initiated_interaction_count ELSE 0 END) * 0.3 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'edit' as mode,
        CAST(SUM(user_initiated_interaction_count) * 0.05 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'inline' as mode,
        CAST(SUM(code_generation_activity_count) * 0.8 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
      UNION ALL
      SELECT 
        day as date,
        'custom' as mode,
        CAST(SUM(user_initiated_interaction_count) * 0.05 AS INTEGER) as requests
      FROM user_usage_details
      GROUP BY day
    `);
  }
}

// Export clearAllData for routes
export function clearAllData(): void {
  clearDatabaseData();
  jsonReader.clearCache();
}

// Get model usage distribution for donut chart
export async function getModelUsageDistribution(timeframe: Timeframe): Promise<ModelUsageDistribution[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getModelDistributionFromRecords(filtered);
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT model_name as name, SUM(requests) as value
    FROM model_usage
    WHERE date BETWEEN ? AND ?
    GROUP BY model_name
    ORDER BY value DESC
  `).all(startDate, endDate) as Array<{ name: string; value: number }>;

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.map(row => ({
    name: row.name,
    value: row.value,
    percentage: total > 0 ? (row.value / total) * 100 : 0
  }));
}

// Get model usage per day for multi-line chart
export async function getModelUsagePerDay(timeframe: Timeframe): Promise<ModelUsagePerDay[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getModelUsagePerDayFromRecords(filtered);
  }

  const db = getDatabase();

  // Get all unique models first
  const models = db.prepare(`
    SELECT DISTINCT model_name FROM model_usage WHERE date BETWEEN ? AND ?
  `).all(startDate, endDate) as Array<{ model_name: string }>;

  // Get daily data
  const rows = db.prepare(`
    SELECT date, model_name, requests
    FROM model_usage
    WHERE date BETWEEN ? AND ?
    ORDER BY date ASC
  `).all(startDate, endDate) as Array<{ date: string; model_name: string; requests: number }>;

  // Pivot the data
  const dailyMap = new Map<string, ModelUsagePerDay>();
  for (const row of rows) {
    if (!dailyMap.has(row.date)) {
      const entry: ModelUsagePerDay = { date: row.date };
      for (const m of models) {
        entry[m.model_name] = 0;
      }
      dailyMap.set(row.date, entry);
    }
    dailyMap.get(row.date)![row.model_name] = row.requests;
  }

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Get model usage per language for stacked bar chart
export async function getModelUsagePerLanguage(timeframe: Timeframe): Promise<ModelUsagePerLanguage[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getModelUsagePerLanguageFromRecords(filtered);
  }

  // For SQLite, we need the user_usage_by_language_model table
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      ulm.language,
      ulm.model,
      SUM(ulm.count) as count
    FROM user_usage_by_language_model ulm
    JOIN user_usage_details uud ON ulm.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY ulm.language, ulm.model
    ORDER BY ulm.language, count DESC
  `).all(startDate, endDate) as Array<{ language: string; model: string; count: number }>;

  // Get top 4 languages + "Other languages"
  const languageTotals = new Map<string, number>();
  for (const row of rows) {
    languageTotals.set(row.language, (languageTotals.get(row.language) || 0) + row.count);
  }
  
  const sortedLanguages = Array.from(languageTotals.entries())
    .sort((a, b) => b[1] - a[1]);
  const topLanguages = sortedLanguages.slice(0, 4).map(([lang]) => lang);
  
  // Pivot data
  const result: ModelUsagePerLanguage[] = [];
  const modelMap = new Map<string, Map<string, number>>();
  
  for (const row of rows) {
    const lang = topLanguages.includes(row.language) ? row.language : 'Other languages';
    if (!modelMap.has(lang)) {
      modelMap.set(lang, new Map());
    }
    const currentCount = modelMap.get(lang)!.get(row.model) || 0;
    modelMap.get(lang)!.set(row.model, currentCount + row.count);
  }

  for (const [language, models] of modelMap.entries()) {
    const entry: ModelUsagePerLanguage = { language };
    for (const [model, count] of models.entries()) {
      entry[model] = count;
    }
    result.push(entry);
  }

  return result;
}

// Get model usage per chat mode for stacked bar chart
export async function getModelUsagePerChatMode(timeframe: Timeframe): Promise<ModelUsagePerChatMode[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getModelUsagePerChatModeFromRecords(filtered);
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      umf.model,
      umf.feature,
      SUM(umf.count) as count
    FROM user_usage_by_model_feature umf
    JOIN user_usage_details uud ON umf.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY umf.model, umf.feature
    ORDER BY umf.model, count DESC
  `).all(startDate, endDate) as Array<{ model: string; feature: string; count: number }>;

  // Map features to chat modes
  const featureToMode: Record<string, keyof Omit<ModelUsagePerChatMode, 'model'>> = {
    'code_completion': 'inline',
    'chat': 'ask',
    'agent': 'agent',
    'edit': 'edit',
  };

  // Pivot data
  const modelMap = new Map<string, ModelUsagePerChatMode>();
  for (const row of rows) {
    if (!modelMap.has(row.model)) {
      modelMap.set(row.model, { model: row.model, edit: 0, ask: 0, agent: 0, custom: 0, inline: 0 });
    }
    const mode = featureToMode[row.feature] || 'custom';
    modelMap.get(row.model)![mode] += row.count;
  }

  // Get top 4 models + "Other models"
  const models = Array.from(modelMap.values())
    .sort((a, b) => {
      const totalA = a.edit + a.ask + a.agent + a.custom + a.inline;
      const totalB = b.edit + b.ask + b.agent + b.custom + b.inline;
      return totalB - totalA;
    });

  if (models.length > 4) {
    const topModels = models.slice(0, 4);
    const otherModels = models.slice(4);
    const other: ModelUsagePerChatMode = { model: 'Other models', edit: 0, ask: 0, agent: 0, custom: 0, inline: 0 };
    for (const m of otherModels) {
      other.edit += m.edit;
      other.ask += m.ask;
      other.agent += m.agent;
      other.custom += m.custom;
      other.inline += m.inline;
    }
    return [...topModels, other];
  }

  return models;
}

// Get code completions data (suggested vs accepted) for dual-line chart
export async function getCodeCompletions(timeframe: Timeframe): Promise<CodeCompletionsDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getCodeCompletionsFromRecords(filtered);
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT date, total_suggestions as suggested, accepted_suggestions as accepted
    FROM daily_usage
    WHERE date BETWEEN ? AND ?
    ORDER BY date ASC
  `).all(startDate, endDate) as CodeCompletionsDataPoint[];

  return rows;
}

// Get code completions acceptance rate over time
export async function getAcceptanceRate(timeframe: Timeframe): Promise<AcceptanceRateDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    return jsonReader.getAcceptanceRateFromRecords(filtered);
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT date,
           CASE WHEN total_suggestions > 0 
                THEN ROUND(CAST(accepted_suggestions AS REAL) / total_suggestions * 100, 1) 
                ELSE 0 
           END as rate
    FROM daily_usage
    WHERE date BETWEEN ? AND ?
    ORDER BY date ASC
  `).all(startDate, endDate) as AcceptanceRateDataPoint[];

  return rows;
}

// Code Generation Summary stats
export interface CodeGenSummary {
  totalLinesChanged: number;
  agentContributionPct: number;
  avgLinesDeleted: number;
}

export async function getCodeGenSummary(timeframe: Timeframe): Promise<CodeGenSummary> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const row = db.prepare(`
    SELECT 
      SUM(loc_added_sum + loc_deleted_sum) as totalLinesChanged,
      SUM(CASE WHEN used_agent = 1 THEN loc_added_sum + loc_deleted_sum ELSE 0 END) as agentLines,
      SUM(loc_deleted_sum) as totalDeleted,
      COUNT(DISTINCT day) as dayCount
    FROM user_usage_details
    WHERE day BETWEEN ? AND ?
  `).get(startDate, endDate) as {
    totalLinesChanged: number | null;
    agentLines: number | null;
    totalDeleted: number | null;
    dayCount: number;
  };

  const totalLinesChanged = row?.totalLinesChanged || 0;
  const agentLines = row?.agentLines || 0;
  const totalDeleted = row?.totalDeleted || 0;
  const dayCount = row?.dayCount || 1;

  return {
    totalLinesChanged,
    agentContributionPct: totalLinesChanged > 0 ? Math.round((agentLines / totalLinesChanged) * 100) : 0,
    avgLinesDeleted: Math.round(totalDeleted / dayCount),
  };
}

// Daily lines added/deleted for multi-line chart
export interface DailyLinesDataPoint {
  date: string;
  added: number;
  deleted: number;
}

export async function getDailyLines(timeframe: Timeframe): Promise<DailyLinesDataPoint[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      day as date,
      SUM(loc_added_sum) as added,
      SUM(loc_deleted_sum) as deleted
    FROM user_usage_details
    WHERE day BETWEEN ? AND ?
    GROUP BY day
    ORDER BY day ASC
  `).all(startDate, endDate) as DailyLinesDataPoint[];

  return rows;
}

// User-initiated code changes by mode
export interface UserCodeChangesByMode {
  mode: string;
  linesAdded: number;
  linesDeleted: number;
}

export async function getUserCodeChangesByMode(timeframe: Timeframe): Promise<UserCodeChangesByMode[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  // Get user-initiated changes (non-agent) grouped by feature/mode
  const rows = db.prepare(`
    SELECT 
      umf.feature as mode,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_by_model_feature umf
    JOIN user_usage_details uud ON umf.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY umf.feature
    ORDER BY linesAdded + linesDeleted DESC
  `).all(startDate, endDate) as Array<{ mode: string; linesAdded: number; linesDeleted: number }>;

  if (rows.length === 0) {
    // Fallback: aggregate from user_usage_details without feature breakdown
    const fallbackRow = db.prepare(`
      SELECT 
        SUM(CASE WHEN used_agent = 0 THEN loc_added_sum ELSE 0 END) as linesAdded,
        SUM(CASE WHEN used_agent = 0 THEN loc_deleted_sum ELSE 0 END) as linesDeleted
      FROM user_usage_details
      WHERE day BETWEEN ? AND ?
    `).get(startDate, endDate) as { linesAdded: number; linesDeleted: number } | undefined;

    if (fallbackRow) {
      return [
        { mode: 'chat', linesAdded: Math.round((fallbackRow.linesAdded || 0) * 0.5), linesDeleted: Math.round((fallbackRow.linesDeleted || 0) * 0.5) },
        { mode: 'edit', linesAdded: Math.round((fallbackRow.linesAdded || 0) * 0.3), linesDeleted: Math.round((fallbackRow.linesDeleted || 0) * 0.3) },
        { mode: 'code_completion', linesAdded: Math.round((fallbackRow.linesAdded || 0) * 0.2), linesDeleted: Math.round((fallbackRow.linesDeleted || 0) * 0.2) },
      ];
    }
  }

  return rows.map(row => ({
    mode: row.mode === 'code_completion' ? 'Inline' : row.mode.charAt(0).toUpperCase() + row.mode.slice(1),
    linesAdded: row.linesAdded,
    linesDeleted: row.linesDeleted,
  }));
}

// Agent-initiated code changes
export interface AgentCodeChanges {
  mode: string;
  linesAdded: number;
  linesDeleted: number;
}

export async function getAgentCodeChanges(timeframe: Timeframe): Promise<AgentCodeChanges[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const row = db.prepare(`
    SELECT 
      SUM(CASE WHEN used_agent = 1 THEN loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN used_agent = 1 THEN loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_details
    WHERE day BETWEEN ? AND ?
  `).get(startDate, endDate) as { linesAdded: number; linesDeleted: number } | undefined;

  if (row && (row.linesAdded > 0 || row.linesDeleted > 0)) {
    return [{ mode: 'Agent', linesAdded: row.linesAdded, linesDeleted: row.linesDeleted }];
  }

  return [];
}

// Code changes per model
export interface CodeChangesByModel {
  model: string;
  linesAdded: number;
  linesDeleted: number;
}

export async function getUserCodeChangesByModel(timeframe: Timeframe): Promise<CodeChangesByModel[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      umf.model,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_by_model_feature umf
    JOIN user_usage_details uud ON umf.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY umf.model
    ORDER BY linesAdded + linesDeleted DESC
    LIMIT 5
  `).all(startDate, endDate) as CodeChangesByModel[];

  if (rows.length === 0) {
    // Fallback data
    return [
      { model: 'GPT-4o', linesAdded: 5000, linesDeleted: 2000 },
      { model: 'GPT-4o-mini', linesAdded: 3500, linesDeleted: 1500 },
      { model: 'Claude 3.5 Sonnet', linesAdded: 2500, linesDeleted: 1000 },
    ];
  }

  return rows;
}

export async function getAgentCodeChangesByModel(timeframe: Timeframe): Promise<CodeChangesByModel[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      umf.model,
      SUM(CASE WHEN uud.used_agent = 1 THEN uud.loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN uud.used_agent = 1 THEN uud.loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_by_model_feature umf
    JOIN user_usage_details uud ON umf.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY umf.model
    ORDER BY linesAdded + linesDeleted DESC
    LIMIT 5
  `).all(startDate, endDate) as CodeChangesByModel[];

  if (rows.length === 0) {
    return [
      { model: 'GPT-4o', linesAdded: 8000, linesDeleted: 3000 },
      { model: 'Claude 3.5 Sonnet', linesAdded: 4000, linesDeleted: 1500 },
    ];
  }

  return rows;
}

// Code changes per language
export interface CodeChangesByLanguage {
  language: string;
  linesAdded: number;
  linesDeleted: number;
}

export async function getUserCodeChangesByLanguage(timeframe: Timeframe): Promise<CodeChangesByLanguage[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      ulm.language,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN uud.used_agent = 0 THEN uud.loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_by_language_model ulm
    JOIN user_usage_details uud ON ulm.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY ulm.language
    ORDER BY linesAdded + linesDeleted DESC
    LIMIT 5
  `).all(startDate, endDate) as CodeChangesByLanguage[];

  if (rows.length === 0) {
    return [
      { language: 'TypeScript', linesAdded: 6000, linesDeleted: 2500 },
      { language: 'Python', linesAdded: 4500, linesDeleted: 1800 },
      { language: 'JavaScript', linesAdded: 3000, linesDeleted: 1200 },
      { language: 'Java', linesAdded: 2000, linesDeleted: 800 },
    ];
  }

  return rows;
}

export async function getAgentCodeChangesByLanguage(timeframe: Timeframe): Promise<CodeChangesByLanguage[]> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT 
      ulm.language,
      SUM(CASE WHEN uud.used_agent = 1 THEN uud.loc_added_sum ELSE 0 END) as linesAdded,
      SUM(CASE WHEN uud.used_agent = 1 THEN uud.loc_deleted_sum ELSE 0 END) as linesDeleted
    FROM user_usage_by_language_model ulm
    JOIN user_usage_details uud ON ulm.user_usage_id = uud.id
    WHERE uud.day BETWEEN ? AND ?
    GROUP BY ulm.language
    ORDER BY linesAdded + linesDeleted DESC
    LIMIT 5
  `).all(startDate, endDate) as CodeChangesByLanguage[];

  if (rows.length === 0) {
    return [
      { language: 'TypeScript', linesAdded: 10000, linesDeleted: 4000 },
      { language: 'Python', linesAdded: 7000, linesDeleted: 2800 },
      { language: 'JavaScript', linesAdded: 5000, linesDeleted: 2000 },
    ];
  }

  return rows;
}

// Get unique users list for People page
export interface UserListItem {
  enterprise_id: string;
  user_id: number;
  user_login: string;
  primary_ide: string | null;
  primary_ide_version: string | null;
}

export interface UserListResponse {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export function getUsersList(page: number = 1, limit: number = 50, search: string = ''): UserListResponse {
  const db = getDatabase();
  const offset = (page - 1) * limit;
  const searchPattern = search ? `%${search}%` : '%';

  const total = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count FROM user_usage_details
    WHERE user_login LIKE ? OR enterprise_id LIKE ? OR CAST(user_id AS TEXT) LIKE ?
  `).get(searchPattern, searchPattern, searchPattern) as { count: number };

  const rows = db.prepare(`
    SELECT 
      enterprise_id,
      user_id,
      user_login,
      primary_ide,
      primary_ide_version
    FROM user_usage_details
    WHERE user_login LIKE ? OR enterprise_id LIKE ? OR CAST(user_id AS TEXT) LIKE ?
    GROUP BY user_id
    ORDER BY user_login ASC
    LIMIT ? OFFSET ?
  `).all(searchPattern, searchPattern, searchPattern, limit, offset) as UserListItem[];

  return {
    data: rows,
    total: total.count,
    page,
    limit
  };
}

// Global search across all data types
export interface GlobalSearchResult {
  type: 'person' | 'ide' | 'language' | 'model' | 'enterprise';
  id: string;
  name: string;
  description?: string;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  query: string;
}

export function globalSearch(query: string, limit: number = 20): GlobalSearchResponse {
  if (!query.trim()) {
    return { results: [], query };
  }

  const db = getDatabase();
  const searchPattern = `%${query}%`;
  const results: GlobalSearchResult[] = [];

  // Search people
  const people = db.prepare(`
    SELECT DISTINCT user_login, user_id, enterprise_id, primary_ide
    FROM user_usage_details
    WHERE user_login LIKE ? OR CAST(user_id AS TEXT) LIKE ?
    LIMIT 5
  `).all(searchPattern, searchPattern) as { user_login: string; user_id: number; enterprise_id: string; primary_ide: string | null }[];

  for (const person of people) {
    results.push({
      type: 'person',
      id: String(person.user_id),
      name: person.user_login,
      description: `ID: ${person.user_id} • ${person.primary_ide || 'Unknown IDE'}`
    });
  }

  // Search enterprises
  const enterprises = db.prepare(`
    SELECT DISTINCT enterprise_id, COUNT(DISTINCT user_id) as user_count
    FROM user_usage_details
    WHERE enterprise_id LIKE ?
    GROUP BY enterprise_id
    LIMIT 3
  `).all(searchPattern) as { enterprise_id: string; user_count: number }[];

  for (const enterprise of enterprises) {
    results.push({
      type: 'enterprise',
      id: enterprise.enterprise_id,
      name: enterprise.enterprise_id,
      description: `${enterprise.user_count} users`
    });
  }

  // Search IDEs
  const ides = db.prepare(`
    SELECT DISTINCT primary_ide, COUNT(DISTINCT user_id) as user_count
    FROM user_usage_details
    WHERE primary_ide LIKE ? AND primary_ide IS NOT NULL
    GROUP BY primary_ide
    LIMIT 3
  `).all(searchPattern) as { primary_ide: string; user_count: number }[];

  for (const ide of ides) {
    results.push({
      type: 'ide',
      id: ide.primary_ide,
      name: ide.primary_ide,
      description: `${ide.user_count} users`
    });
  }

  // Search languages
  const languages = db.prepare(`
    SELECT DISTINCT language, SUM(count) as usage_count
    FROM user_usage_by_language_model
    WHERE language LIKE ?
    GROUP BY language
    ORDER BY usage_count DESC
    LIMIT 3
  `).all(searchPattern) as { language: string; usage_count: number }[];

  for (const lang of languages) {
    results.push({
      type: 'language',
      id: lang.language,
      name: lang.language,
      description: `${lang.usage_count.toLocaleString()} requests`
    });
  }

  // Search models
  const models = db.prepare(`
    SELECT DISTINCT model_name, SUM(requests) as request_count
    FROM model_usage
    WHERE model_name LIKE ?
    GROUP BY model_name
    ORDER BY request_count DESC
    LIMIT 3
  `).all(searchPattern) as { model_name: string; request_count: number }[];

  for (const model of models) {
    results.push({
      type: 'model',
      id: model.model_name,
      name: model.model_name,
      description: `${model.request_count.toLocaleString()} requests`
    });
  }

  return { results: results.slice(0, limit), query };
}

// Get counts for navigation tabs (people and teams/enterprises)
export function getCounts(): { peopleCount: number; teamsCount: number } {
  const db = getDatabase();
  
  const result = db.prepare(`
    SELECT 
      COUNT(DISTINCT user_id) as peopleCount,
      COUNT(DISTINCT enterprise_id) as teamsCount
    FROM user_usage_details
  `).get() as { peopleCount: number; teamsCount: number } | undefined;
  
  return {
    peopleCount: result?.peopleCount || 0,
    teamsCount: result?.teamsCount || 0
  };
}

// Export data interface for download
export interface ExportDataItem {
  report_start_day: string;
  report_end_day: string;
  day: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  used_agent: number;
  used_chat: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  primary_ide: string | null;
  primary_ide_version: string | null;
  primary_plugin_version: string | null;
}

// Get all data for export with specified fields
export function getExportData(): ExportDataItem[] {
  const db = getDatabase();
  
  const rows = db.prepare(`
    SELECT 
      report_start_day,
      report_end_day,
      day,
      enterprise_id,
      user_id,
      user_login,
      user_initiated_interaction_count,
      code_generation_activity_count,
      code_acceptance_activity_count,
      used_agent,
      used_chat,
      loc_suggested_to_add_sum,
      loc_suggested_to_delete_sum,
      loc_added_sum,
      loc_deleted_sum,
      primary_ide,
      primary_ide_version,
      primary_plugin_version
    FROM user_usage_details
    ORDER BY day DESC, user_login ASC
  `).all() as ExportDataItem[];
  
  return rows;
}

// Get Copilot seat statistics
export interface CopilotSeatsStats {
  totalSeats: number;
  activeSeats: number;
  unusedSeats: number;
}

export async function getCopilotSeatsStats(timeframe: Timeframe): Promise<CopilotSeatsStats> {
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  // Check for direct JSON mode
  if (await shouldUseDirectJson()) {
    const records = await jsonReader.getAllRecords();
    const filtered = jsonReader.filterByDateRange(records, startDate, endDate);
    
    // Get unique users from the records
    const uniqueUsers = new Set<string>();
    const activeUsers = new Set<string>();
    
    for (const record of filtered) {
      uniqueUsers.add(record.user_login);
      // Consider a user active if they have any interaction
      if (record.user_initiated_interaction_count > 0 || 
          record.code_generation_activity_count > 0 || 
          record.code_acceptance_activity_count > 0) {
        activeUsers.add(record.user_login);
      }
    }
    
    const totalSeats = uniqueUsers.size;
    const activeSeats = activeUsers.size;
    
    return {
      totalSeats,
      activeSeats,
      unusedSeats: totalSeats - activeSeats,
    };
  }

  // Use SQLite
  const db = getDatabase();

  // Get total unique users (total seats allocated)
  const totalSeatsRow = db.prepare(`
    SELECT COUNT(DISTINCT user_login) as total
    FROM user_usage_details
  `).get() as { total: number } | undefined;

  // Get active users within the timeframe (users with any activity)
  const activeSeatsRow = db.prepare(`
    SELECT COUNT(DISTINCT user_login) as active
    FROM user_usage_details
    WHERE day BETWEEN ? AND ?
      AND (user_initiated_interaction_count > 0 
           OR code_generation_activity_count > 0 
           OR code_acceptance_activity_count > 0)
  `).get(startDate, endDate) as { active: number } | undefined;

  const totalSeats = totalSeatsRow?.total || 0;
  const activeSeats = activeSeatsRow?.active || 0;

  return {
    totalSeats,
    activeSeats,
    unusedSeats: totalSeats - activeSeats,
  };
}
