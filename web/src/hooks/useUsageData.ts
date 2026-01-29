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

export function useUserDetails(timeframe: Timeframe, page: number, limit: number) {
  return useQuery({
    queryKey: ['userDetails', timeframe, page, limit],
    queryFn: () => api.fetchUserDetails(timeframe, page, limit),
  });
}

export function useIDEUsage(timeframe: Timeframe) {
  return useQuery({
    queryKey: ['ideUsage', timeframe],
    queryFn: () => api.fetchIDEUsage(timeframe),
  });
}
