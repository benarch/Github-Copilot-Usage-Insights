export type Timeframe = '7' | '14' | '28' | '90';

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

export interface ChatRequest {
  message: string;
  context?: {
    timeframe?: Timeframe;
  };
}

export interface ChatResponse {
  response: string;
  data?: any[];
  suggestedFollowups?: string[];
}

// Model usage distribution for donut chart
export interface ModelUsageDistribution {
  name: string;
  value: number;
  percentage: number;
}

// Model usage per day for multi-line chart
export interface ModelUsagePerDay {
  date: string;
  [model: string]: string | number;
}

// Language usage per day for stacked area chart
export interface LanguageUsagePerDay {
  date: string;
  [language: string]: string | number;
}

// Model usage per language for stacked bar chart
export interface ModelUsagePerLanguage {
  language: string;
  [model: string]: string | number;
}

// Model usage per chat mode for stacked bar chart
export interface ModelUsagePerChatMode {
  model: string;
  edit: number;
  ask: number;
  agent: number;
  custom: number;
  inline: number;
  [key: string]: string | number; // Index signature for dynamic access
}

// Code completions data for dual-line chart
export interface CodeCompletionsDataPoint {
  date: string;
  suggested: number;
  accepted: number;
  [key: string]: string | number;
}

// Code completions acceptance rate
export interface AcceptanceRateDataPoint {
  date: string;
  rate: number;
}

// Copilot seat information
export interface SeatInfo {
  totalSeats: number;
  activeSeats: number;
  unusedSeats: number;
  utilizationRate: number;
}

// Code generation summary stats
export interface CodeGenSummary {
  linesOfCodeChanged: number;
  agentContribution: number;
  avgLinesDeletedByAgent: number;
}

// Daily lines added/deleted
export interface DailyLinesDataPoint {
  date: string;
  added: number;
  deleted: number;
}

// User-initiated code changes by mode
export interface UserCodeChangesByMode {
  mode: string;
  suggested: number;
  added: number;
}

// Agent-initiated code changes
export interface AgentCodeChanges {
  mode: string;
  added: number;
  deleted: number;
}

// Code changes by model
export interface CodeChangesByModel {
  model: string;
  suggested: number;
  added: number;
  deleted: number;
}

// Code changes by language
export interface CodeChangesByLanguage {
  language: string;
  suggested: number;
  added: number;
  deleted: number;
}
