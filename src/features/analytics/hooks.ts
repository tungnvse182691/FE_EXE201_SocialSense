import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import { authKeys } from '@/features/auth/hooks';
import { Config } from '@/constants/config';
import {
  analyzeAnalytics,
  compareAnalytics,
  uploadAnalyticsFile,
  uploadAndCompare,
  getAnalyticsHistory,
  getAnalyticsReport,
} from './api';
import type { AnalyzeRequest, CompareRequest } from '@/types/api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  history: (page: number) => ['analytics', 'history', page] as const,
  report: (id: number) => ['analytics', 'report', id] as const,
};

// ─── useAnalyze ───────────────────────────────────────────────────────────────

/** Phân tích 1 kỳ — trừ 1 quota */
export function useAnalyze() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: AnalyzeRequest) => analyzeAnalytics(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.quota });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

// ─── useCompare ───────────────────────────────────────────────────────────────

/** So sánh 2 kỳ — trừ 1 quota */
export function useCompare() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CompareRequest) => compareAnalytics(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.quota });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

// ─── useUploadAnalytics ───────────────────────────────────────────────────────

/** Parse file Excel thành metrics (không tốn quota) */
export function useUploadAnalytics() {
  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadAnalyticsFile(file),
  });
}

// ─── useUploadAndCompare ──────────────────────────────────────────────────────

/** Upload file + so sánh 1 bước (trừ 1 quota) */
export function useUploadAndCompare() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadAndCompare(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.quota });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

// ─── useAnalyticsHistory ──────────────────────────────────────────────────────

export function useAnalyticsHistory(page = 1) {
  const { isAuthenticated } = useAuthStore();
  const pageSize = 10;

  return useQuery({
    queryKey: analyticsKeys.history(page),
    queryFn: () => getAnalyticsHistory(page, pageSize),
    enabled: isAuthenticated,
    staleTime: Config.QUERY.STALE_TIME,
  });
}

// ─── useAnalyticsReport ───────────────────────────────────────────────────────

export function useAnalyticsReport(id: number) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: analyticsKeys.report(id),
    queryFn: () => getAnalyticsReport(id),
    enabled: isAuthenticated && id > 0,
    staleTime: Infinity, // Report không thay đổi sau khi tạo
  });
}
