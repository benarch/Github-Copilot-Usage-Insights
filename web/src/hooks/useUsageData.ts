import { useQuery } from '@tanstack/react-query';
import type { Timeframe } from '@/types';
import * as api from '@/lib/api';

export function useSummary(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['summary', timeframe],
    queryFn: () => api.fetchSummary(timeframe),
  });
}

export function useDailyActiveUsers(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['dailyActiveUsers', timeframe],
    queryFn: () => api.fetchDailyActiveUsers(timeframe),
  });
}

export function useWeeklyActiveUsers(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['weeklyActiveUsers', timeframe],
    queryFn: () => api.fetchWeeklyActiveUsers(timeframe),
  });
}

export function useAvgChatRequests(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['avgChatRequests', timeframe],
    queryFn: () => api.fetchAvgChatRequests(timeframe),
  });
}

export function useChatModeRequests(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['chatModeRequests', timeframe],
    queryFn: () => api.fetchChatModeRequests(timeframe),
  });
}

export function useCodeGeneration(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['codeGeneration', timeframe],
    queryFn: () => api.fetchCodeGeneration(timeframe),
  });
}

export function useUserDetails(timeframe: Timeframe, page: number, limit: number, search: string = '') {
  return useQuery({
    queryKey: ['userDetails', timeframe, page, limit, search],
    queryFn: () => api.fetchUserDetails(timeframe, page, limit, search),
  });
}

export function useIDEUsage(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['ideUsage', timeframe],
    queryFn: () => api.fetchIDEUsage(timeframe),
  });
}

export function useModelDistribution(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['modelDistribution', timeframe],
    queryFn: () => api.fetchModelDistribution(timeframe),
  });
}

export function useModelUsagePerDay(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['modelUsagePerDay', timeframe],
    queryFn: () => api.fetchModelUsagePerDay(timeframe),
  });
}

export function useModelUsagePerLanguage(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['modelUsagePerLanguage', timeframe],
    queryFn: () => api.fetchModelUsagePerLanguage(timeframe),
  });
}

export function useModelUsagePerChatMode(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['modelUsagePerChatMode', timeframe],
    queryFn: () => api.fetchModelUsagePerChatMode(timeframe),
  });
}

export function useCodeCompletions(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['codeCompletions', timeframe],
    queryFn: () => api.fetchCodeCompletions(timeframe),
  });
}

export function useAcceptanceRate(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['acceptanceRate', timeframe],
    queryFn: () => api.fetchAcceptanceRate(timeframe),
  });
}

export function useCodeGenSummary(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['codeGenSummary', timeframe],
    queryFn: () => api.fetchCodeGenSummary(timeframe),
  });
}

export function useDailyLines(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['dailyLines', timeframe],
    queryFn: () => api.fetchDailyLines(timeframe),
  });
}

export function useUserCodeChangesByMode(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['userCodeChangesByMode', timeframe],
    queryFn: () => api.fetchUserCodeChangesByMode(timeframe),
  });
}

export function useAgentCodeChanges(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['agentCodeChanges', timeframe],
    queryFn: () => api.fetchAgentCodeChanges(timeframe),
  });
}

export function useUserCodeChangesByModel(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['userCodeChangesByModel', timeframe],
    queryFn: () => api.fetchUserCodeChangesByModel(timeframe),
  });
}

export function useAgentCodeChangesByModel(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['agentCodeChangesByModel', timeframe],
    queryFn: () => api.fetchAgentCodeChangesByModel(timeframe),
  });
}

export function useUserCodeChangesByLanguage(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['userCodeChangesByLanguage', timeframe],
    queryFn: () => api.fetchUserCodeChangesByLanguage(timeframe),
  });
}

export function useAgentCodeChangesByLanguage(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['agentCodeChangesByLanguage', timeframe],
    queryFn: () => api.fetchAgentCodeChangesByLanguage(timeframe),
  });
}

export function useIDEWeeklyActiveUsers(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['ideWeeklyActiveUsers', timeframe],
    queryFn: () => api.fetchIDEWeeklyActiveUsers(timeframe),
  });
}

export function useUsersList(page: number = 1, limit: number = 50, search: string = '') {
  return useQuery({
    queryKey: ['usersList', page, limit, search],
    queryFn: () => api.fetchUsersList(page, limit, search),
  });
}
