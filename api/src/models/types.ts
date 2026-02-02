import { z } from 'zod';

// Zod schemas for validation
export const TimeframeSchema = z.enum(['7', '14', '28', '90']);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const DailyUsageSchema = z.object({
  id: z.number(),
  date: z.string(),
  active_users: z.number(),
  total_suggestions: z.number(),
  accepted_suggestions: z.number(),
  chat_requests: z.number(),
  agent_requests: z.number(),
});
export type DailyUsage = z.infer<typeof DailyUsageSchema>;

export const WeeklyUsageSchema = z.object({
  id: z.number(),
  week_start: z.string(),
  active_users: z.number(),
  total_suggestions: z.number(),
  accepted_suggestions: z.number(),
  chat_requests: z.number(),
  agent_requests: z.number(),
});
export type WeeklyUsage = z.infer<typeof WeeklyUsageSchema>;

export const ChatModeRequestSchema = z.object({
  id: z.number(),
  date: z.string(),
  mode: z.enum(['edit', 'ask', 'agent', 'custom', 'inline']),
  requests: z.number(),
});
export type ChatModeRequest = z.infer<typeof ChatModeRequestSchema>;

export const ModelUsageSchema = z.object({
  id: z.number(),
  date: z.string(),
  model_name: z.string(),
  requests: z.number(),
});
export type ModelUsage = z.infer<typeof ModelUsageSchema>;

export const AgentAdoptionSchema = z.object({
  id: z.number(),
  date: z.string(),
  total_active_users: z.number(),
  agent_users: z.number(),
});
export type AgentAdoption = z.infer<typeof AgentAdoptionSchema>;

// API Response types
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
}

// Code completions data for dual-line chart
export interface CodeCompletionsDataPoint {
  date: string;
  suggested: number;
  accepted: number;
}

// Code completions acceptance rate
export interface AcceptanceRateDataPoint {
  date: string;
  rate: number;
}

// Copilot seat statistics
export interface CopilotSeatsStats {
  totalSeats: number;
  activeSeats: number;
  unusedSeats: number;
}

// NDJSON Data Schemas for ingestion
export const NDJSONTotalsByIdeSchema = z.object({
  ide: z.string(),
  code_generation_activity_count: z.number().optional().default(0),
  code_acceptance_activity_count: z.number().optional().default(0),
  loc_suggested_to_add_sum: z.number().optional().default(0),
  loc_added_sum: z.number().optional().default(0),
});
export type NDJSONTotalsByIde = z.infer<typeof NDJSONTotalsByIdeSchema>;

export const NDJSONTotalsByFeatureSchema = z.object({
  feature: z.string(),
  user_initiated_interaction_count: z.number().optional().default(0),
  code_generation_activity_count: z.number().optional().default(0),
  code_acceptance_activity_count: z.number().optional().default(0),
});
export type NDJSONTotalsByFeature = z.infer<typeof NDJSONTotalsByFeatureSchema>;

export const NDJSONTotalsByLanguageFeatureSchema = z.object({
  language: z.string(),
  feature: z.string(),
  count: z.number().optional().default(0),
});
export type NDJSONTotalsByLanguageFeature = z.infer<typeof NDJSONTotalsByLanguageFeatureSchema>;

export const NDJSONTotalsByLanguageModelSchema = z.object({
  language: z.string(),
  model: z.string(),
  count: z.number().optional().default(0),
});
export type NDJSONTotalsByLanguageModel = z.infer<typeof NDJSONTotalsByLanguageModelSchema>;

export const NDJSONTotalsByModelFeatureSchema = z.object({
  model: z.string(),
  feature: z.string(),
  count: z.number().optional().default(0),
});
export type NDJSONTotalsByModelFeature = z.infer<typeof NDJSONTotalsByModelFeatureSchema>;

export const NDJSONRecordSchema = z.object({
  report_start_day: z.string(),
  report_end_day: z.string(),
  day: z.string(),
  enterprise_id: z.string(),
  user_id: z.number(),
  user_login: z.string(),
  user_initiated_interaction_count: z.number().optional().default(0),
  code_generation_activity_count: z.number().optional().default(0),
  code_acceptance_activity_count: z.number().optional().default(0),
  used_agent: z.boolean().optional().default(false),
  used_chat: z.boolean().optional().default(false),
  loc_suggested_to_add_sum: z.number().optional().default(0),
  loc_suggested_to_delete_sum: z.number().optional().default(0),
  loc_added_sum: z.number().optional().default(0),
  loc_deleted_sum: z.number().optional().default(0),
  totals_by_ide: z.array(NDJSONTotalsByIdeSchema).optional().default([]),
  totals_by_feature: z.array(NDJSONTotalsByFeatureSchema).optional().default([]),
  totals_by_language_feature: z.array(NDJSONTotalsByLanguageFeatureSchema).optional().default([]),
  totals_by_language_model: z.array(NDJSONTotalsByLanguageModelSchema).optional().default([]),
  totals_by_model_feature: z.array(NDJSONTotalsByModelFeatureSchema).optional().default([]),
});
export type NDJSONRecord = z.infer<typeof NDJSONRecordSchema>;

