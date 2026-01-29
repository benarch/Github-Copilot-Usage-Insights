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
