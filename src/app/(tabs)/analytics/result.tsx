import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAnalyticsReport } from '@/features/analytics/hooks';
import { OverallScoreCard } from '@/features/analytics/components/OverallScoreCard';
import { MetricRow } from '@/features/analytics/components/MetricRow';
import { HighlightWarningList } from '@/features/analytics/components/HighlightWarningList';

export default function AnalyticsResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reportId = parseInt(id ?? '0', 10);

  const { data: report, isLoading, isError } = useAnalyticsReport(reportId);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center" style={{ gap: 12 }}>
        <ActivityIndicator size="large" color="#111827" />
        <Text className="text-base font-semibold text-gray-900 dark:text-white text-center px-8">
          AI đang phân tích số liệu của bạn...
        </Text>
        <Text className="text-sm text-gray-400">Có thể mất 20–30 giây</Text>
      </SafeAreaView>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (isError || !report) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center" style={{ gap: 12 }}>
        <Text className="text-4xl">⚠️</Text>
        <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
          Không tải được kết quả
        </Text>
        <TouchableOpacity
          className="px-5 py-3 bg-gray-900 dark:bg-white rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white dark:text-gray-900 font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const result    = report.result;
  const isCompare = report.reportType === 'compare';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header — pattern giống generate/result.tsx */}
      <View className="px-5 pt-4 pb-4 flex-row items-center justify-between bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/analytics/history' as any)}>
          <Text className="text-primary-500 font-medium">← Quay lại</Text>
        </TouchableOpacity>
        <View className="flex-1 items-center px-3">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {isCompare ? 'So sánh 2 kỳ' : 'Phân tích 1 kỳ'}
          </Text>
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {report.platform} · {report.periodALabel}
            {isCompare && report.periodBLabel ? ` vs ${report.periodBLabel}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          className="px-3 py-1.5 bg-gray-900 rounded-lg"
          onPress={() => router.push('/(tabs)/analytics/form' as any)}
        >
          <Text className="text-white text-xs font-semibold">Phân tích mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score */}
        <OverallScoreCard
          score={result.summary.overallScore}
          trend={result.summary.overallTrend}
          topRecommendation={result.summary.topRecommendation}
        />

        {/* Highlights & Warnings */}
        <HighlightWarningList
          highlights={result.summary.highlights}
          warnings={result.summary.warnings}
        />

        {/* AI Narrative */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4" style={{ gap: 8 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="w-8 h-8 bg-gray-100 rounded-xl items-center justify-center">
              <MaterialIcons name="auto-awesome" size={18} color="#374151" />
            </View>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">Nhận xét từ AI</Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-300 leading-6">
            {result.aiNarrative}
          </Text>
        </View>

        {/* Metrics list */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700" style={{ gap: 3 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              Chi tiết từng chỉ số
            </Text>
            {isCompare && (
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {report.periodALabel}
                </Text>
                <Text className="text-xs text-gray-400">vs</Text>
                <Text className="text-xs text-gray-400">{report.periodBLabel}</Text>
              </View>
            )}
          </View>
          {result.metrics.map((metric) => (
            <MetricRow key={metric.metricKey} metric={metric} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
