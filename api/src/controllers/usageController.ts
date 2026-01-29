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
