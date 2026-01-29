import { z } from 'zod';

// Zod schemas for validation
export const TimeframeSchema = z.enum(['7', '14', '28']);
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
