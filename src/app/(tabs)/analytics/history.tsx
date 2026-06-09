import React, { useState } from 'react';import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAnalyticsHistory } from '@/features/analytics/hooks';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import type { AnalyticsHistoryItem, AnalyticsOverallTrend } from '@/types/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TREND_ICON: Record<AnalyticsOverallTrend, keyof typeof MaterialIcons.glyphMap> = {
  growing:   'trending-up',
  stable:    'trending-flat',
  declining: 'trending-down',
};

const TREND_LABEL: Record<AnalyticsOverallTrend, string> = {
  growing:   'Tăng trưởng',
  stable:    'Ổn định',
  declining: 'Đang giảm',
};

const TREND_ICON_COLOR: Record<AnalyticsOverallTrend, string> = {
  growing:   '#374151',
  stable:    '#374151',
  declining: '#374151',
};

function getScoreColor(score: number) {
  if (score >= 70) return 'border-green-400';
  if (score >= 40) return 'border-amber-400';
  return 'border-red-400';
}

function getScoreTextColor(score: number) {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

// ─── HistoryCard ──────────────────────────────────────────────────────────────

function HistoryCard({
  item,
  onPress,
}: {
  item: AnalyticsHistoryItem;
  onPress: () => void;
}) {
  const isCompare = item.reportType === 'compare';
  const formattedDate = format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700"
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
    >
      <View className="flex-row items-center" style={{ gap: 12 }}>
        {/* Score circle */}
        <View
          className={`w-12 h-12 rounded-full border-2 items-center justify-center ${getScoreColor(item.overallScore)}`}
        >
          <Text className={`text-base font-extrabold ${getScoreTextColor(item.overallScore)}`}>
            {item.overallScore}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1" style={{ gap: 2 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              {item.platform}
            </Text>
            <View className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {isCompare ? 'So sánh' : '1 kỳ'}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-700 dark:text-gray-200" numberOfLines={1}>
            {item.periodALabel}
            {isCompare && item.periodBLabel ? ` vs ${item.periodBLabel}` : ''}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">{formattedDate}</Text>
        </View>

        {/* Trend */}
        <View className="items-center" style={{ gap: 2 }}>
          <MaterialIcons name={TREND_ICON[item.overallTrend]} size={22} color="#374151" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {TREND_LABEL[item.overallTrend]}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AnalyticsHistoryScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<AnalyticsHistoryItem[]>([]);
  const { data, isLoading, isError } = useAnalyticsHistory(page);

  // Append items mới vào list khi page thay đổi
  React.useEffect(() => {
    if (data?.data?.length) {
      if (page === 1) {
        // Reset khi refresh về page 1
        setAllItems(data.data);
      } else {
        // Append page mới, tránh duplicate
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const newItems = data.data.filter((i) => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header — pattern giống persona.tsx: inline text back */}
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/analytics' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3"
        >
          <Text className="text-primary-500 text-base font-medium">← Quay lại</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">Lịch sử phân tích</Text>
        <TouchableOpacity
          className="w-9 h-9 rounded-xl bg-gray-900 items-center justify-center"
          onPress={() => router.push('/(tabs)/analytics/form' as any)}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-4 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center" style={{ gap: 8 }}>
          <Text className="text-gray-400 dark:text-gray-500 text-base">
            Không tải được lịch sử
          </Text>
          <TouchableOpacity
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl"
            onPress={() => router.push('/(tabs)/analytics')}
          >
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() => router.push(`/(tabs)/analytics/result?id=${item.id}`)}
            />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                iconName="bar-chart"
                title="Chưa có phân tích nào"
                description="Phân tích số liệu mạng xã hội để xem kết quả tại đây"
                actionLabel="Phân tích ngay"
                onAction={() => router.push('/(tabs)/analytics/form' as any)}
              />
            ) : null
          }
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#111827" size="small" />
              </View>
            ) : data?.data?.length === 10 ? (
              <TouchableOpacity
                className="py-3 items-center border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800"
                onPress={() => setPage((p) => p + 1)}
              >
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Tải thêm
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
