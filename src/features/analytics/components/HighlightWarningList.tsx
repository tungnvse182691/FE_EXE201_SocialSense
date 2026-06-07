import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HighlightWarningListProps {
  highlights: string[];
  warnings: string[];
}

export function HighlightWarningList({ highlights, warnings }: HighlightWarningListProps) {
  if (!highlights.length && !warnings.length) return null;

  return (
    <View style={{ gap: 10 }}>
      {highlights.length > 0 && (
        <View style={{ gap: 6 }}>
          <View className="flex-row items-center px-1" style={{ gap: 6 }}>
            <MaterialIcons name="check-circle-outline" size={14} color="#374151" />
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Điểm sáng
            </Text>
          </View>
          {highlights.map((h, i) => (
            <View
              key={i}
              className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 flex-row items-start"
              style={{ gap: 8 }}
            >
              <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-5">{h}</Text>
            </View>
          ))}
        </View>
      )}

      {warnings.length > 0 && (
        <View style={{ gap: 6 }}>
          <View className="flex-row items-center px-1" style={{ gap: 6 }}>
            <MaterialIcons name="error-outline" size={14} color="#374151" />
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Cần chú ý
            </Text>
          </View>
          {warnings.map((w, i) => (
            <View
              key={i}
              className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 flex-row items-start"
              style={{ gap: 8 }}
            >
              <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-5">{w}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
