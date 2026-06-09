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
import { useTrends, useTrendTags, useRecommendedTrends } from '@/features/trends/hooks';
import { TrendCard } from '@/components/ui/TrendCard';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/layout/AppHeader';
import type { TrendItem } from '@/types/api';

// 'recommended' là mode đặc biệt, không phải tagId
type FilterMode = number | 'recommended' | undefined;

export default function TrendsScreen() {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<FilterMode>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const isRecommended = filterMode === 'recommended';
  const selectedTagId = typeof filterMode === 'number' ? filterMode : undefined;

  const normalQuery = useTrends(isRecommended ? undefined : selectedTagId);
  const recommendedQuery = useRecommendedTrends();

  const activeQuery = isRecommended ? recommendedQuery : normalQuery;

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
  const allTrends: TrendItem[] = data?.pages.flatMap((p) => p.items) ?? [];
  const trends: TrendItem[] = searchQuery.trim()
    ? allTrends.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allTrends;

  const handleGeneratePress = useCallback(
    (trendId: number) => {
      router.push({ pathname: '/(tabs)/generate', params: { trendId: String(trendId) } });
    },
    [router]
  );

  const handleLoadMore = () => {
    if (searchQuery.trim()) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

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
        style={{ flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: 'center' }}
      >
        {/* Chip: Dành cho bạn */}
        <TouchableOpacity
          className={`flex-row items-center px-3 py-1.5 rounded-full border ${
            isRecommended
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
          }`}
          style={{ gap: 4 }}
          onPress={() => setFilterMode(isRecommended ? undefined : 'recommended')}
        >
          <MaterialIcons
            name="star"
            size={12}
            color={isRecommended ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text className={`text-xs font-medium ${isRecommended ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            Dành cho bạn
          </Text>
        </TouchableOpacity>

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
          iconName={searchQuery ? 'search-off' : isRecommended ? 'star-border' : 'wifi-off'}
          title={
            searchQuery ? `Không tìm thấy "${searchQuery}"`
            : isRecommended ? 'Chưa có gợi ý cho bạn'
            : 'Chưa có xu hướng nào'
          }
          description={
            searchQuery ? 'Thử từ khoá khác'
            : isRecommended ? 'Hoàn thiện Persona để nhận gợi ý phù hợp hơn'
            : 'Thử chọn tag khác hoặc quay lại sau'
          }
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
