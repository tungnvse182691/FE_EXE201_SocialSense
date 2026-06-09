import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrends, useTrendTags } from '@/features/trends/hooks';
import { TrendCard } from '@/components/ui/TrendCard';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/layout/AppHeader';
import type { TrendItem } from '@/types/api';

export default function TrendsScreen() {
  const router = useRouter();
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useTrends(selectedTagId);

  const { data: tags } = useTrendTags();

  // Flatten + filter theo search query
  const allTrends: TrendItem[] = data?.pages.flatMap((p) => p.items) ?? [];
  const trends: TrendItem[] = searchQuery.trim()
    ? allTrends.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allTrends;

  const handleGeneratePress = useCallback(
    (trendId: number) => {
      router.push({
        pathname: '/(tabs)/generate',
        params: { trendId: String(trendId) },
      });
    },
    [router]
  );

  const handleLoadMore = () => {
    // Không load more khi đang search (filter local)
    if (searchQuery.trim()) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Logo Header */}
      <AppHeader title="Xu hướng" subtitle="Các chủ đề đang hot hôm nay" />

      {/* Search box */}
      <View className="px-5 pt-3 pb-2">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5" style={{ gap: 8 }}>
          <MaterialIcons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-sm text-gray-900 dark:text-white"
            placeholder="Tìm kiếm xu hướng..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tag Filter Bar — horizontal scroll */}
      {tags && tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ height: 52 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' }}
        >
          {/* "Tất cả" option */}
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full border ${
              selectedTagId === undefined
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setSelectedTagId(undefined)}
          >
            <Text
              className={`text-xs font-medium ${
                selectedTagId === undefined ? 'text-white' : 'text-gray-600'
              }`}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              className={`px-3 py-1.5 rounded-full border ${
                selectedTagId === tag.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setSelectedTagId(tag.id)}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedTagId === tag.id ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Trend List */}
      {isLoading ? (
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </View>
      ) : trends.length === 0 ? (
        <EmptyState
          iconName={searchQuery ? 'search-off' : 'wifi-off'}
          title={searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có xu hướng nào'}
          description={searchQuery ? 'Thử từ khoá khác' : 'Thử chọn tag khác hoặc quay lại sau'}
          actionLabel={searchQuery ? 'Xoá tìm kiếm' : 'Làm mới'}
          onAction={() => searchQuery ? setSearchQuery('') : refetch()}
        />
      ) : (
        <FlatList
          data={trends}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TrendCard trend={item} onGeneratePress={handleGeneratePress} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          // Pull-to-refresh
          onRefresh={refetch}
          refreshing={isRefetching}
          // Infinite scroll
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                color="#111827"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
