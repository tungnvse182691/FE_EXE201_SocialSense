import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getTrends, getTrendTags, getRecommendedTrends } from './api';
import { useAuthStore } from '@/features/auth/store';
import { Config } from '@/constants/config';

export const trendKeys = {
  all: ['trends'] as const,
  list: (tagId?: number) => ['trends', 'list', tagId] as const,
  recommended: ['trends', 'recommended'] as const,
  tags: ['trends', 'tags'] as const,
};

export function useTrends(tagId?: number) {
  return useInfiniteQuery({
    queryKey: trendKeys.list(tagId),
    queryFn: ({ pageParam = 1 }) =>
      getTrends({
        page: pageParam as number,
        pageSize: Config.PAGINATION.TRENDS_PAGE_SIZE,
        tagId,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: Config.QUERY.STALE_TIME,
  });
}

export function useRecommendedTrends() {
  const { isAuthenticated } = useAuthStore();
  return useInfiniteQuery({
    queryKey: trendKeys.recommended,
    queryFn: ({ pageParam = 1 }) =>
      getRecommendedTrends({
        page: pageParam as number,
        pageSize: Config.PAGINATION.TRENDS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    enabled: isAuthenticated,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: Config.QUERY.STALE_TIME,
  });
}

export function useTrendTags() {
  return useQuery({
    queryKey: trendKeys.tags,
    queryFn: getTrendTags,
    staleTime: Config.QUERY.STALE_TIME,
  });
}
