import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AnalyticsOverallTrend } from '@/types/api';

interface OverallScoreCardProps {
  score: number;
  trend: AnalyticsOverallTrend;
  topRecommendation: string;
}

const TREND_CONFIG: Record<AnalyticsOverallTrend, { icon: keyof typeof MaterialIcons.glyphMap; label: string; textColor: string }> = {
  growing:   { icon: 'trending-up',   label: 'Đang tăng trưởng', textColor: 'text-gray-900 dark:text-white' },
  stable:    { icon: 'trending-flat', label: 'Ổn định',           textColor: 'text-gray-900 dark:text-white' },
  declining: { icon: 'trending-down', label: 'Đang giảm',         textColor: 'text-gray-900 dark:text-white' },
};

function getScoreBorderColor(score: number): string {
  if (score >= 70) return 'border-green-400';
  if (score >= 40) return 'border-amber-400';
  return 'border-red-400';
}

function getScoreTextColor(score: number): string {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export function OverallScoreCard({ score, trend, topRecommendation }: OverallScoreCardProps) {
  const trendCfg = TREND_CONFIG[trend];

  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4"
      style={{ gap: 14 }}
    >
      {/* Score + trend row */}
      <View className="flex-row items-center" style={{ gap: 16 }}>
        {/* Score circle */}
        <View
          className={`w-20 h-20 rounded-full border-4 items-center justify-center ${getScoreBorderColor(score)}`}
        >
          <Text className={`text-2xl font-extrabold leading-7 ${getScoreTextColor(score)}`}>
            {score}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium">/ 100</Text>
        </View>

        {/* Trend info */}
        <View className="flex-1" style={{ gap: 4 }}>
          <View className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center">
            <MaterialIcons name={trendCfg.icon} size={20} color="#374151" />
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">{trendCfg.label}</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">Điểm tổng quan</Text>
        </View>
      </View>

      {/* Top recommendation */}
      <View
        className="flex-row items-start bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
        style={{ gap: 8 }}
      >
        <View className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-lg items-center justify-center mt-0.5">
          <MaterialIcons name="lightbulb-outline" size={15} color="#374151" />
        </View>
        <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-5">
          {topRecommendation}
        </Text>
      </View>
    </View>
  );
}
