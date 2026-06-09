import React, { useState, useCallback, useMemo } from 'react';
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

type FilterMode = number | undefined;

export default function TrendsScreen() {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<FilterMode>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTagId = filterMode;

  const activeQuery = useTrends(selectedTagId);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = activeQuery;

  const { data: tags } = useTrendTags();

  // Flatten + filter theo search
  const allTrends: TrendItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );
  const trends: TrendItem[] = useMemo(
    () =>
      searchQuery.trim()
        ? allTrends.filter(
            (t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : allTrends,
    [allTrends, searchQuery]
  );

  const handleGeneratePress = useCallback(
    (trendId: number) => {
      router.push({ pathname: '/(tabs)/generate', params: { trendId: String(trendId) } });
    },
    [router]
  );

  const handleLoadMore = useCallback(() => {
    if (searchQuery.trim()) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [searchQuery, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: TrendItem }) => (
      <TrendCard trend={item} onGeneratePress={handleGeneratePress} />
    ),
    [handleGeneratePress]
  );

  const keyExtractor = useCallback((item: TrendItem) => String(item.id), []);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <AppHeader title="Xu hướng" subtitle="Các chủ đề đang hot hôm nay" />

      {/* Search box */}
      <View className="px-4 pt-3 pb-1">
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5" style={{ gap: 8 }}>
          <MaterialIcons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-sm text-gray-900 dark:text-white"
            placeholder="Tìm kiếm xu hướng..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 48, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: 'center' }}
      >


        {/* Chip: Tất cả */}
        <TouchableOpacity
          className={`px-3 py-1.5 rounded-full border ${
            filterMode === undefined
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
          }`}
          onPress={() => setFilterMode(undefined)}
        >
          <Text className={`text-xs font-medium ${filterMode === undefined ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            Tất cả
          </Text>
        </TouchableOpacity>

        {/* Tag chips */}
        {tags?.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            className={`px-3 py-1.5 rounded-full border ${
              selectedTagId === tag.id
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}
            onPress={() => setFilterMode(selectedTagId === tag.id ? undefined : tag.id)}
          >
            <Text className={`text-xs font-medium ${selectedTagId === tag.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trend List */}
      {isLoading ? (
        <View className="px-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : trends.length === 0 ? (
        <EmptyState
          iconName={searchQuery ? 'search-off' : 'wifi-off'}
          title={
            searchQuery ? `Không tìm thấy "${searchQuery}"` : 'Chưa có xu hướng nào'
          }
          description={
            searchQuery ? 'Thử từ khoá khác' : 'Thử chọn tag khác hoặc quay lại sau'
          }
          actionLabel={searchQuery ? 'Xoá tìm kiếm' : 'Làm mới'}
          onAction={() => searchQuery ? setSearchQuery('') : refetch()}
        />
      ) : (
        <FlatList
          data={trends}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#111827" style={{ marginVertical: 16 }} />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
