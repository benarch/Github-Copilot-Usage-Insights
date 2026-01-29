import type { 
  Timeframe, 
  DashboardSummary, 
  ChartDataPoint, 
  StackedChartDataPoint,
  CodeGenerationStats,
  UserUsageDetailsResponse,
  IDEUsageData,
  ChatRequest,
  ChatResponse
} from '@/types';

const API_BASE = '/api/usage';
const CHAT_API_BASE = '/api/chat';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchSummary(timeframe: Timeframe): Promise<DashboardSummary> {
  return fetchJson(`${API_BASE}/summary?timeframe=${timeframe}`);
}

export async function fetchDailyActiveUsers(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  return fetchJson(`${API_BASE}/daily-active-users?timeframe=${timeframe}`);
}

export async function fetchWeeklyActiveUsers(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  return fetchJson(`${API_BASE}/weekly-active-users?timeframe=${timeframe}`);
}

export async function fetchAvgChatRequests(timeframe: Timeframe): Promise<ChartDataPoint[]> {
  return fetchJson(`${API_BASE}/avg-chat-requests?timeframe=${timeframe}`);
}

export async function fetchChatModeRequests(timeframe: Timeframe): Promise<StackedChartDataPoint[]> {
  return fetchJson(`${API_BASE}/chat-mode-requests?timeframe=${timeframe}`);
}

export async function fetchCodeGeneration(timeframe: Timeframe): Promise<CodeGenerationStats> {
  return fetchJson(`${API_BASE}/code-generation?timeframe=${timeframe}`);
}

export async function fetchUserDetails(
  timeframe: Timeframe, 
  page: number = 1, 
  limit: number = 50
): Promise<UserUsageDetailsResponse> {
  return fetchJson(`${API_BASE}/user-details?timeframe=${timeframe}&page=${page}&limit=${limit}`);
}

export async function fetchIDEUsage(timeframe: Timeframe): Promise<IDEUsageData[]> {
  return fetchJson(`${API_BASE}/ide-usage?timeframe=${timeframe}`);
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return postJson(`${CHAT_API_BASE}`, request);
}
