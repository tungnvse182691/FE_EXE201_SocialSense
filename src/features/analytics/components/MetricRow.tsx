import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AnalyticsMetricItem, AnalyticsMetricStatus } from '@/types/api';

interface MetricRowProps {
  metric: AnalyticsMetricItem;
}

const STATUS_DOT: Record<AnalyticsMetricStatus, string> = {
  good:     'bg-green-500',
  warning:  'bg-amber-400',
  critical: 'bg-red-500',
  neutral:  'bg-gray-400',
};

const STATUS_BADGE_BG: Record<AnalyticsMetricStatus, string> = {
  good:     'bg-green-50 dark:bg-green-900/30',
  warning:  'bg-amber-50 dark:bg-amber-900/30',
  critical: 'bg-red-50 dark:bg-red-900/30',
  neutral:  'bg-gray-100 dark:bg-gray-700',
};

const STATUS_BADGE_TEXT: Record<AnalyticsMetricStatus, string> = {
  good:     'text-green-700 dark:text-green-400',
  warning:  'text-amber-700 dark:text-amber-400',
  critical: 'text-red-700 dark:text-red-400',
  neutral:  'text-gray-500 dark:text-gray-400',
};

const STATUS_LABEL: Record<AnalyticsMetricStatus, string> = {
  good:     'Tốt',
  warning:  'Chú ý',
  critical: 'Cần cải thiện',
  neutral:  '—',
};

export function MetricRow({ metric }: MetricRowProps) {
  const [expanded, setExpanded] = useState(false);

  const hasChange  = metric.changePercent !== null && metric.changePercent !== undefined;
  const changeVal  = metric.changePercent ?? 0;
  const isPositive = changeVal > 0;
  const isNeutral  = changeVal === 0;

  const arrowColor: string = isNeutral
    ? '#9CA3AF'
    : metric.higherIsBetter
      ? (isPositive ? '#10B981' : '#EF4444')
      : (isPositive ? '#EF4444' : '#10B981');

  const arrowClass: string = isNeutral
    ? 'text-gray-400'
    : metric.higherIsBetter
      ? (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')
      : (isPositive ? 'text-red-500 dark:text-red-400'    : 'text-green-600 dark:text-green-400');

  const arrowIcon = isNeutral ? 'remove' : isPositive ? 'arrow-upward' : 'arrow-downward';

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.6}
      className="px-4 py-3 border-b border-gray-50 dark:border-gray-700"
    >
      {/* ── Layout 2 cột ── */}
      <View className="flex-row items-start" style={{ gap: 10 }}>

        {/* Cột trái: tên + simpleExplain */}
        <View className="flex-1" style={{ gap: 2 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <View className={`w-2 h-2 rounded-full mt-0.5 ${STATUS_DOT[metric.status]}`} />
            <Text className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1">
              {metric.metricName}
            </Text>
          </View>
          {expanded && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 leading-4 pl-4">
              {metric.simpleExplain}
            </Text>
          )}
        </View>

        {/* Cột phải: giá trị + change + badge + expand icon */}
        <View className="items-end" style={{ gap: 4 }}>
          {/* Hàng 1: giá trị A (kỳ này) + mũi tên % */}
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-white">
              {metric.valueAFormatted}
            </Text>
            {hasChange && (
              <View className="flex-row items-center" style={{ gap: 2 }}>
                <MaterialIcons name={arrowIcon as any} size={12} color={arrowColor} />
                <Text className={`text-xs font-semibold ${arrowClass}`}>
                  {Math.abs(changeVal).toFixed(1)}%
                </Text>
              </View>
            )}
            <MaterialIcons
              name={expanded ? 'expand-less' : 'expand-more'}
              size={16}
              color="#9CA3AF"
            />
          </View>

          {/* Hàng 2: giá trị B (kỳ trước) + status badge */}
          <View className="flex-row items-center" style={{ gap: 6 }}>
            {metric.valueBFormatted && (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {metric.valueBFormatted}
              </Text>
            )}
            <View className={`px-1.5 py-0.5 rounded-md ${STATUS_BADGE_BG[metric.status]}`}>
              <Text className={`text-xs font-semibold ${STATUS_BADGE_TEXT[metric.status]}`}>
                {STATUS_LABEL[metric.status]}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Detail khi expand */}
      {expanded && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 leading-5 mt-2 pl-4">
          {metric.detail}
        </Text>
      )}
    </TouchableOpacity>
  );
}
