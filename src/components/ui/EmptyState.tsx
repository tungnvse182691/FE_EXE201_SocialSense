import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon ? <Text className="text-5xl mb-4">{icon}</Text> : null}
      <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">{title}</Text>
      {description ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
