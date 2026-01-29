import { getDatabase } from '../models/database.js';
import type { 
  DailyUsage, 
  WeeklyUsage, 
  ChatModeRequest, 
  ModelUsage, 
  AgentAdoption,
  DashboardSummary,
  ChartDataPoint,
  StackedChartDataPoint,
  Timeframe
} from '../models/types.js';

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
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

export function getDashboardSummary(timeframe: Timeframe): DashboardSummary {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

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

export function getDailyActiveUsers(timeframe: Timeframe): ChartDataPoint[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  const rows = db.prepare(`
    SELECT date, active_users as value FROM daily_usage 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date ASC
  `).all(startDate, endDate) as ChartDataPoint[];

  return rows;
}

export function getWeeklyActiveUsers(timeframe: Timeframe): ChartDataPoint[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

  const rows = db.prepare(`
    SELECT week_start as date, active_users as value FROM weekly_usage 
    WHERE week_start BETWEEN ? AND ? 
    ORDER BY week_start ASC
  `).all(startDate, endDate) as ChartDataPoint[];

  return rows;
}

export function getAverageChatRequestsPerUser(timeframe: Timeframe): ChartDataPoint[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

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

export function getChatModeRequests(timeframe: Timeframe): StackedChartDataPoint[] {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

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

export function getCodeGenerationStats(timeframe: Timeframe): { 
  totalSuggestions: number; 
  acceptedSuggestions: number; 
  acceptanceRate: number;
  dailyData: Array<{ date: string; suggestions: number; accepted: number }>;
} {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);

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

export function getUserUsageDetails(
  timeframe: Timeframe,
  page: number = 1,
  limit: number = 50
): UserUsageDetailsResponse {
  const db = getDatabase();
  const days = parseInt(timeframe);
  const { startDate, endDate } = getDateRange(days);
  const offset = (page - 1) * limit;

  // Get total count
  const countRow = db.prepare(`
    SELECT COUNT(*) as total FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
  `).get(startDate, endDate) as { total: number };

  // Get paginated data
  const rows = db.prepare(`
    SELECT 
      report_start_day, report_end_day, day, enterprise_id, user_id, user_login,
      user_initiated_interaction_count, code_generation_activity_count, code_acceptance_activity_count,
      used_agent, used_chat, loc_suggested_to_add_sum, loc_suggested_to_delete_sum,
      loc_added_sum, loc_deleted_sum, primary_ide, primary_ide_version, primary_plugin_version
    FROM user_usage_details 
    WHERE day BETWEEN ? AND ?
    ORDER BY day DESC, user_login ASC
    LIMIT ? OFFSET ?
  `).all(startDate, endDate, limit, offset) as Array<{
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
