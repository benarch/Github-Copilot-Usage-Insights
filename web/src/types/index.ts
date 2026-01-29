export type Timeframe = '7' | '14' | '28';

export interface DashboardSummary {
  ideActiveUsers: number;
  agentAdoption: {
    percentage: number;
    agentUsers: number;
    totalActiveUsers: number;
  };
  mostUsedChatModel: {
    name: string;
    requests: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface StackedChartDataPoint {
  date: string;
  edit: number;
  ask: number;
  agent: number;
  custom: number;
  inline: number;
}

export interface CodeGenerationStats {
  totalSuggestions: number;
  acceptedSuggestions: number;
  acceptanceRate: number;
  dailyData: Array<{ date: string; suggestions: number; accepted: number }>;
}

export interface UserUsageDetail {
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

export interface UserUsageDetailsResponse {
  data: UserUsageDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface IDEUsageData {
  ide: string;
  users: number;
  interactions: number;
}
