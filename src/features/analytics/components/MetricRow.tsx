import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AnalyticsMetricItem, AnalyticsMetricStatus } from '@/types/api';

interface MetricRowProps {
  metric: AnalyticsMetricItem;
}

// Tailwind class maps — phải dùng full class string để NativeWind không bị purge
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

  const hasChange   = metric.changePercent !== null && metric.changePercent !== undefined;
  const changeVal   = metric.changePercent ?? 0;
  const isPositive  = changeVal > 0;
  const isNeutral   = changeVal === 0;

  // Màu mũi tên: dựa theo higherIsBetter
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
      {/* Main row */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
        {/* Status dot */}
        <View className={`w-2 h-2 rounded-full ${STATUS_DOT[metric.status]}`} />

        {/* Metric name */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {metric.metricName}
          </Text>
          {expanded && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-4">
              {metric.simpleExplain}
            </Text>
          )}
        </View>

        {/* Values */}
        <View className="items-end" style={{ minWidth: 60 }}>
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {metric.valueAFormatted}
          </Text>
          {metric.valueBFormatted && (
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {metric.valueBFormatted}
            </Text>
          )}
        </View>

        {/* Change % */}
        {hasChange && (
          <View className="flex-row items-center" style={{ gap: 2, minWidth: 52 }}>
            <MaterialIcons name={arrowIcon as any} size={13} color={arrowColor} />
            <Text className={`text-xs font-semibold ${arrowClass}`}>
              {Math.abs(changeVal).toFixed(1)}%
            </Text>
          </View>
        )}

        {/* Status badge */}
        <View className={`px-1.5 py-0.5 rounded-md ${STATUS_BADGE_BG[metric.status]}`}>
          <Text className={`text-xs font-semibold ${STATUS_BADGE_TEXT[metric.status]}`}>
            {STATUS_LABEL[metric.status]}
          </Text>
        </View>

        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={18}
          color="#9CA3AF"
        />
      </View>

      {/* Detail (expanded) */}
      {expanded && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 leading-5 mt-2 pl-5">
          {metric.detail}
        </Text>
      )}
    </TouchableOpacity>
  );
}
