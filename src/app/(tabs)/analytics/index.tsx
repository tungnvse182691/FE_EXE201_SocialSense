import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAnalyticsHistory } from '@/features/analytics/hooks';

export default function AnalyticsLandingScreen() {
  const router = useRouter();
  const { data: historyData } = useAnalyticsHistory(1);
  const reportCount = historyData?.data?.length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AppHeader
        title="Phân tích Analytics"
        subtitle="Hiểu số liệu mạng xã hội qua AI"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mô tả ngắn */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4" style={{ gap: 8 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
              <MaterialIcons name="auto-awesome" size={18} color="#374151" />
            </View>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              AI phân tích cho bạn
            </Text>
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5">
            Nhập số liệu từ TikTok, Facebook, Instagram hoặc YouTube — AI sẽ giải thích từng chỉ số, so sánh 2 kỳ và đưa ra gợi ý hành động cụ thể.
          </Text>
        </View>

        {/* CTA chính: Phân tích mới */}
        <TouchableOpacity
          className="bg-gray-900 dark:bg-white rounded-2xl p-4 flex-row items-center"
          style={{ gap: 14 }}
          onPress={() => router.push('/(tabs)/analytics/form' as any)}
          activeOpacity={0.85}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <MaterialIcons name="add-chart" size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white dark:text-gray-900 font-bold text-base">
              Phân tích mới
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Nhập số liệu thủ công hoặc upload file Excel
            </Text>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* CTA phụ: Lịch sử */}
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex-row items-center"
          style={{ gap: 14 }}
          onPress={() => router.push('/(tabs)/analytics/history' as any)}
          activeOpacity={0.85}
        >
          <View className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl items-center justify-center">
            <MaterialIcons name="history" size={24} color="#374151" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-white font-bold text-base">
              Lịch sử phân tích
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              {reportCount > 0
                ? `${reportCount} báo cáo gần đây`
                : 'Xem lại các báo cáo trước đó'}
            </Text>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Divider + hướng dẫn nhanh */}
        <View className="mt-2">
          <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3 px-1">
            Cách dùng
          </Text>

          {[
            { icon: 'edit-note'       as const, step: '1', text: 'Nhập số liệu kỳ này và kỳ trước từ trang thống kê của nền tảng' },
            { icon: 'auto-awesome'    as const, step: '2', text: 'AI phân tích, so sánh và giải thích từng chỉ số bằng ngôn ngữ đơn giản' },
            { icon: 'lightbulb-outline' as const, step: '3', text: 'Nhận gợi ý hành động cụ thể để cải thiện hiệu quả kỳ sau' },
          ].map((item) => (
            <View
              key={item.step}
              className="flex-row items-start mb-3"
              style={{ gap: 12 }}
            >
              <View className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.step}</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-600 dark:text-gray-400 leading-5">
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
