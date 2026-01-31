import type { 
  Timeframe, 
  DashboardSummary, 
  ChartDataPoint, 
  StackedChartDataPoint,
  CodeGenerationStats,
  UserUsageDetailsResponse,
  IDEUsageData,
  ChatRequest,
  ChatResponse,
  ModelUsageDistribution,
  ModelUsagePerDay,
  ModelUsagePerLanguage,
  ModelUsagePerChatMode,
  CodeCompletionsDataPoint,
  AcceptanceRateDataPoint,
  CodeGenSummary,
  DailyLinesDataPoint,
  UserCodeChangesByMode,
  AgentCodeChanges,
  CodeChangesByModel,
  CodeChangesByLanguage
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

export async function uploadJsonFile(file: File): Promise<{ success: boolean; message: string; recordsImported?: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchModelDistribution(timeframe: Timeframe): Promise<ModelUsageDistribution[]> {
  return fetchJson(`${API_BASE}/model-distribution?timeframe=${timeframe}`);
}

export async function fetchModelUsagePerDay(timeframe: Timeframe): Promise<ModelUsagePerDay[]> {
  return fetchJson(`${API_BASE}/model-usage-per-day?timeframe=${timeframe}`);
}

export async function fetchModelUsagePerLanguage(timeframe: Timeframe): Promise<ModelUsagePerLanguage[]> {
  return fetchJson(`${API_BASE}/model-usage-per-language?timeframe=${timeframe}`);
}

export async function fetchModelUsagePerChatMode(timeframe: Timeframe): Promise<ModelUsagePerChatMode[]> {
  return fetchJson(`${API_BASE}/model-usage-per-chat-mode?timeframe=${timeframe}`);
}

export async function fetchCodeCompletions(timeframe: Timeframe): Promise<CodeCompletionsDataPoint[]> {
  return fetchJson(`${API_BASE}/code-completions?timeframe=${timeframe}`);
}

export async function fetchAcceptanceRate(timeframe: Timeframe): Promise<AcceptanceRateDataPoint[]> {
  return fetchJson(`${API_BASE}/acceptance-rate?timeframe=${timeframe}`);
}

export async function fetchCodeGenSummary(timeframe: Timeframe): Promise<CodeGenSummary> {
  return fetchJson(`${API_BASE}/code-gen-summary?timeframe=${timeframe}`);
}

export async function fetchDailyLines(timeframe: Timeframe): Promise<DailyLinesDataPoint[]> {
  return fetchJson(`${API_BASE}/daily-lines?timeframe=${timeframe}`);
}

export async function fetchUserCodeChangesByMode(timeframe: Timeframe): Promise<UserCodeChangesByMode[]> {
  return fetchJson(`${API_BASE}/user-code-changes-by-mode?timeframe=${timeframe}`);
}

export async function fetchAgentCodeChanges(timeframe: Timeframe): Promise<AgentCodeChanges[]> {
  return fetchJson(`${API_BASE}/agent-code-changes?timeframe=${timeframe}`);
}

export async function fetchUserCodeChangesByModel(timeframe: Timeframe): Promise<CodeChangesByModel[]> {
  return fetchJson(`${API_BASE}/user-code-changes-by-model?timeframe=${timeframe}`);
}

export async function fetchAgentCodeChangesByModel(timeframe: Timeframe): Promise<CodeChangesByModel[]> {
  return fetchJson(`${API_BASE}/agent-code-changes-by-model?timeframe=${timeframe}`);
}

export async function fetchUserCodeChangesByLanguage(timeframe: Timeframe): Promise<CodeChangesByLanguage[]> {
  return fetchJson(`${API_BASE}/user-code-changes-by-language?timeframe=${timeframe}`);
}

export async function fetchAgentCodeChangesByLanguage(timeframe: Timeframe): Promise<CodeChangesByLanguage[]> {
  return fetchJson(`${API_BASE}/agent-code-changes-by-language?timeframe=${timeframe}`);
}

export async function clearAllData(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/clear`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to clear data' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface IDEWeeklyActiveUsers {
  week_start: string;
  ide: string;
  users: number;
}

export async function fetchIDEWeeklyActiveUsers(timeframe: Timeframe): Promise<IDEWeeklyActiveUsers[]> {
  return fetchJson(`${API_BASE}/ide-weekly-active-users?timeframe=${timeframe}`);
}

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

export async function fetchUsersList(page: number = 1, limit: number = 50, search: string = ''): Promise<UserListResponse> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return fetchJson(`${API_BASE}/users?page=${page}&limit=${limit}${searchParam}`);
}

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

export async function globalSearch(query: string, limit: number = 20): Promise<GlobalSearchResponse> {
  return fetchJson(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export interface NavCounts {
  peopleCount: number;
  teamsCount: number;
}

export async function fetchNavCounts(): Promise<NavCounts> {
  return fetchJson(`${API_BASE}/counts`);
}
