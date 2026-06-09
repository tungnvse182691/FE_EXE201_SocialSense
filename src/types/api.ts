// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
  hasContext: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName: string;
}

export interface UpdateProfileResponse {
  message: string;
  displayName: string;
  email: string;
}

// ─── Forgot / Reset Password ──────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  /** BE luôn trả "Nếu email tồn tại, mã OTP đã được gửi." */
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  /** Đúng 6 ký tự số */
  otpCode: string;
  /** Tối thiểu 6 ký tự */
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  hasContext: boolean;
  tier: 'Free' | 'Pro' | 'Ultra' | 'Enterprise';
  dailyQuotaLimit: number;
  remainingQuota: number;
  isUnlimited: boolean;
  roles: string[];
}

export interface QuotaResponse {
  userId: number;
  tier: 'Free' | 'Pro' | 'Ultra' | 'Enterprise';
  dailyQuotaLimit: number;
  remainingQuota: number;
  usedToday: number;
  isUnlimited: boolean;
  usagePercent: number;
  lastQuotaReset: string;
  nextResetAt: string;
  tierBenefits: {
    free: string;
    pro: string;
    enterprise: string;
  };
}

// ─── Persona ─────────────────────────────────────────────────────────────────

export interface PersonaProfile {
  userId: number;
  version: number;
  language: string;
  jobTitle: string;
  toneOfVoice: string;
  platformPreferences: string[];
  targetAudience: string[];
  contentFormats: string[];
  negativeConstraints: string[];
  updatedAt: string;
}

export interface OnboardingRequest {
  language: string;
  answers: string[];
}

export interface OnboardingResponse {
  personaVersion: number;
  status: string;
}

export interface UpdatePersonaRequest {
  jobTitle?: string;
  toneOfVoice?: string;
  language?: string;
  platformPreferences?: string[];
  targetAudience?: string[];
  contentFormats?: string[];
  negativeConstraints?: string[];
}

// ─── Content ─────────────────────────────────────────────────────────────────

export type ContentMode = 'TrendBased' | 'PersonaDriven';
export type ContentLanguage = 'vi' | 'en';

export interface GenerateContentRequest {
  outputCount: 1 | 2 | 3;
  language: ContentLanguage;
  targetPlatforms: string[];
  generateImage: boolean;
  mode: ContentMode;
  trendId?: number;
  userInstruction?: string;
}

export interface GeneratedContentItem {
  platform: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  language: string;
  mediaUrl: string | null;
  bannerImagePrompt: string;
  bestTimeToPost: string;
}

export interface GenerateContentResponse {
  items: GeneratedContentItem[];
  selectedTrendTitle: string | null;
  smartMatchReason: string;
}

export interface ContentHistoryItem {
  id: number;
  userId: number;
  originalTrendId: number | null;
  generatedContent: GeneratedContentItem[];
  userEditedContent: Partial<GeneratedContentItem> | null;
  isEdited: boolean;
  mediaUrl: string | null;
  createdAt: string;
}

export interface PaginatedHistoryResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  items: ContentHistoryItem[];
}

export interface EditHistoryRequest {
  body?: string;
  hook?: string;
  cta?: string;
}

// ─── Trends ──────────────────────────────────────────────────────────────────

export interface TagItem {
  id: number;
  name: string;
  slug: string;
}

export interface TrendItem {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  hotLevel: number;
  createdAt: string;
  tags: TagItem[];
}

export interface TrendListResponse {
  page: number;
  pageSize: number;
  total: number;
  items: TrendItem[];
}

// ─── Knowledge ───────────────────────────────────────────────────────────────

export interface KnowledgeManualRequest {
  title: string;
  rawContent: string;
}

export interface KnowledgeScrapeRequest {
  targetUrl: string;
}

export interface KnowledgeResponse {
  message: string;
  itemId: number;
  title?: string;
  fileName?: string;
  sourceUrl?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentTier = 'Pro' | 'Ultra';
export type OrderStatus = 'Pending' | 'Paid' | 'Cancelled' | 'Expired';

export interface PaymentPlan {
  tier: string;
  price: number;
  billingCycle: string;
  features: string[];
}

export interface PaymentPlansResponse {
  plans: PaymentPlan[];
}

export interface CreatePaymentRequest {
  tier: PaymentTier;
}

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
}

export interface PaymentOrder {
  orderId: number;
  orderCode: number;
  checkoutUrl: string;
  qrCodeUrl: string;
  bankTransfer: BankTransferInfo;
  expiresAt: string;
}

export interface OrderStatusResponse {
  orderId: number;
  orderCode: number;
  status: OrderStatus;
  tier: string;
  amount: number;
  paidAt: string | null;
  createdAt: string;
}

export interface SubscriptionResponse {
  userId: number;
  tier: string;
  status: 'Active' | 'NoSubscription' | 'Expired' | 'Cancelled' | 'None';
  startedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  isActive: boolean;
}

export interface PaymentHistoryItem {
  orderId: number;
  orderCode: number;
  tier: string;
  amount: number;
  status: OrderStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface PaginatedPaymentHistory {
  totalCount: number;
  page: number;
  pageSize: number;
  items: PaymentHistoryItem[];
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalContentGenerated: number;
  totalKnowledgeItems: number;
  totalTrends: number;
  activeApiKeys: number;
  coolingDownApiKeys: number;
  last7DaysContent: Array<{
    date: string;
    contentGenerated: number;
    newUsers: number;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  isActive: boolean;
  hasContext: boolean;
  tier: string;
  dailyQuotaLimit: number;
  remainingQuota: number;
  lastQuotaReset: string;
  createdAt: string;
  roles: string[];
  totalContentGenerated: number;
}

export interface AdminUsersResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: AdminUser[];
}

export interface ApiKeyItem {
  id: number;
  label: string;
  keySuffix: string;
  provider: string;
  modelOverride: string | null;
  supportsImageGen: boolean;
  isActive: boolean;
  isEncrypted: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isInCooldown: boolean;
  cooldownExpiresAt: string | null;
}

export interface CreateApiKeyRequest {
  label: string;
  keyValue: string;
  provider?: string;
  modelOverride?: string;
  supportsImageGen?: boolean;
  notes?: string;
}

export interface UpdateApiKeyRequest {
  label?: string;
  keyValue?: string;
  isActive?: boolean;
  provider?: string;
  modelOverride?: string;
  supportsImageGen?: boolean;
  notes?: string;
}

export interface SupportedModel {
  provider: string;
  modelId: string;
  displayName: string;
  supportsImageGen: boolean;
  isFree: boolean;
  notes: string;
}

export interface SupportedModelsResponse {
  total: number;
  freeModels: SupportedModel[];
  imageModels: SupportedModel[];
  allModels: SupportedModel[];
}

export interface StatsCompareRequest {
  period: 'day' | 'month' | 'quarter' | 'year';
  periodA: string;
  periodB: string;
}

export interface StatsPeriod {
  label: string;
  newUsers: number;
  activeUsers: number;
  totalContentGenerated: number;
  newKnowledgeItems: number;
  newTrends: number;
  // BE PeriodStats có thêm field này
  totalApiCalls: number;
}

export interface StatsCompareResponse {
  periodA: StatsPeriod;
  periodB: StatsPeriod;
  diff: {
    newUsersDiff: number;
    newUsersChangePercent: number;
    contentGeneratedDiff: number;
    contentGeneratedChangePercent: number;
    // BE PeriodDiff có thêm 2 fields này
    newKnowledgeDiff: number;
    newKnowledgeChangePercent: number;
    newTrendsDiff: number;
    newTrendsChangePercent: number;
  };
}

// ─── Image Generation ────────────────────────────────────────────────────────

export interface ClarifyingQuestion {
  id: string;
  question: string;
  /** yesno | choice | text_optional */
  type: 'yesno' | 'choice' | 'text_optional';
  options?: string[];
}

export interface BannerSpecs {
  platform: string;
  dimensions: string;
  aspectRatio: string;
  recommendedStyle: string;
}

export interface ImageAnalyzeRequest {
  contentHistoryId?: number;
  contentText?: string;
  platform: string;
}

export interface ImageAnalyzeResponse {
  imageSummary: string;
  draftPrompt: string;
  detectedIndustry: string;
  clarifyingQuestions: ClarifyingQuestion[];
  bannerSpecs: BannerSpecs;
}

export interface ImageGenerateRequest {
  contentHistoryId?: number;
  contentText?: string;
  platform: string;
  draftPrompt: string;
  detectedIndustry: string;
  answers: Record<string, string>;
}

export interface ImageGenerateResponse {
  imageUrl: string | null;
  finalPrompt: string;
  bannerSpecs: BannerSpecs;
  isGenerated: boolean;
  promptUsageTip: string | null;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsPlatform = 'TikTok' | 'Facebook' | 'Instagram' | 'YouTube';
export type AnalyticsReportType = 'single' | 'compare';
export type AnalyticsMetricStatus = 'good' | 'warning' | 'critical' | 'neutral';
export type AnalyticsOverallTrend = 'growing' | 'stable' | 'declining';

/** Bộ số liệu 1 kỳ — chỉ truyền field có dữ liệu, null sẽ không phân tích */
export interface AnalyticsMetrics {
  platform: AnalyticsPlatform;
  periodLabel: string;
  reach?: number | null;
  impressions?: number | null;
  totalEngagement?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  clicks?: number | null;
  newFollowers?: number | null;
  profileVisits?: number | null;
  engagementRate?: number | null;
  completionRate?: number | null;
  avgViewDurationSeconds?: number | null;
  conversionRate?: number | null;
  clickThroughRate?: number | null;
  postsCount?: number | null;
}

/** Request body cho /analytics/analyze */
export interface AnalyzeRequest {
  metrics: AnalyticsMetrics;
}

/** Request body cho /analytics/compare */
export interface CompareRequest {
  periodA: AnalyticsMetrics;
  periodB: AnalyticsMetrics;
}

/** Từng chỉ số trong kết quả */
export interface AnalyticsMetricItem {
  metricKey: string;
  metricName: string;
  valueAFormatted: string;
  valueBFormatted: string | null;   // null nếu single report
  changePercent: number | null;     // null nếu single report
  status: AnalyticsMetricStatus;
  simpleExplain: string;
  detail: string;
  higherIsBetter: boolean;
}

/** Summary section */
export interface AnalyticsSummary {
  highlights: string[];
  warnings: string[];
  overallScore: number;             // 0–100
  overallTrend: AnalyticsOverallTrend;
  topRecommendation: string;
}

/** Nội dung chi tiết của 1 report (nested trong AnalyticsReportResponse.result) */
export interface AnalyticsResult {
  platform: AnalyticsPlatform;
  reportType: AnalyticsReportType;
  periodALabel: string;
  periodBLabel: string | null;
  metrics: AnalyticsMetricItem[];
  summary: AnalyticsSummary;
  aiNarrative: string;
}

/** Response từ /analyze, /compare, /upload-and-compare, /history/{id} */
export interface AnalyticsReportResponse {
  id: number;
  platform: AnalyticsPlatform;
  reportType: AnalyticsReportType;
  periodALabel: string;
  periodBLabel: string | null;
  createdAt: string;
  result: AnalyticsResult;
}

/** Item trong danh sách lịch sử (/analytics/history) */
export interface AnalyticsHistoryItem {
  id: number;
  platform: AnalyticsPlatform;
  reportType: AnalyticsReportType;
  periodALabel: string;
  periodBLabel: string | null;
  overallScore: number;
  overallTrend: AnalyticsOverallTrend;
  createdAt: string;
}

export interface AnalyticsHistoryResponse {
  page: number;
  pageSize: number;
  data: AnalyticsHistoryItem[];
}

/** Response từ /analytics/upload */
export interface AnalyticsUploadResponse {
  message: string;
  periodA: AnalyticsMetrics;
  periodB: AnalyticsMetrics | null;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  tier?: string;
  remainingQuota?: number;
  dailyLimit?: number;
}
