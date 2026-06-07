import apiClient from '@/lib/api';
import type {
  AnalyzeRequest,
  CompareRequest,
  AnalyticsReportResponse,
  AnalyticsHistoryResponse,
  AnalyticsUploadResponse,
} from '@/types/api';

/** Timeout 90s cho các call AI (analyze/compare có thể mất 20-30s) */
const AI_TIMEOUT = 90_000;

// ─── Template ────────────────────────────────────────────────────────────────

/** Trả về URL để trigger download file template */
export function getTemplateUrl(): string {
  return `${apiClient.defaults.baseURL}/analytics/template`;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

/** Parse file Excel → metrics JSON (không tốn quota) */
export async function uploadAnalyticsFile(
  file: { uri: string; name: string; type: string }
): Promise<AnalyticsUploadResponse> {
  const formData = new FormData();
  formData.append('file', file as any);

  const res = await apiClient.post<AnalyticsUploadResponse>('/analytics/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ─── Analyze ─────────────────────────────────────────────────────────────────

/** AI phân tích 1 kỳ (tốn 1 quota) */
export async function analyzeAnalytics(
  data: AnalyzeRequest
): Promise<AnalyticsReportResponse> {
  const res = await apiClient.post<AnalyticsReportResponse>('/analytics/analyze', data, {
    timeout: AI_TIMEOUT,
  });
  return res.data;
}

// ─── Compare ─────────────────────────────────────────────────────────────────

/** AI so sánh 2 kỳ — periodA = kỳ mới, periodB = kỳ cũ (tốn 1 quota) */
export async function compareAnalytics(
  data: CompareRequest
): Promise<AnalyticsReportResponse> {
  const res = await apiClient.post<AnalyticsReportResponse>('/analytics/compare', data, {
    timeout: AI_TIMEOUT,
  });
  return res.data;
}

// ─── Upload + Compare ────────────────────────────────────────────────────────

/** Upload file Excel và so sánh trong 1 bước (tốn 1 quota) */
export async function uploadAndCompare(
  file: { uri: string; name: string; type: string }
): Promise<AnalyticsReportResponse> {
  const formData = new FormData();
  formData.append('file', file as any);

  const res = await apiClient.post<AnalyticsReportResponse>(
    '/analytics/upload-and-compare',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: AI_TIMEOUT,
    }
  );
  return res.data;
}

// ─── History ─────────────────────────────────────────────────────────────────

/** Danh sách lịch sử phân tích */
export async function getAnalyticsHistory(
  page: number,
  pageSize: number
): Promise<AnalyticsHistoryResponse> {
  const res = await apiClient.get<AnalyticsHistoryResponse>('/analytics/history', {
    params: { page, pageSize },
  });
  return res.data;
}

/** Chi tiết 1 report */
export async function getAnalyticsReport(id: number): Promise<AnalyticsReportResponse> {
  const res = await apiClient.get<AnalyticsReportResponse>(`/analytics/history/${id}`);
  return res.data;
}
