import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useGenerateContent } from '@/features/content/hooks';
import { useContentStore } from '@/features/content/store';
import type { ContentMode } from '@/types/api';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

const PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'Zalo', 'LinkedIn'];
const OUTPUT_COUNTS = [1, 2, 3] as const;

export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trendId?: string; trendTitle?: string; mode?: string }>();

  // Mode selector
  const [mode, setMode] = useState<ContentMode>(
    params.mode === 'PersonaDriven' ? 'PersonaDriven' : 'TrendBased'
  );

  // TrendBased state — chỉ lưu id + title, không cần load toàn bộ trends ở đây nữa
  const [selectedTrend, setSelectedTrend] = useState<{ id: number; title: string } | null>(null);

  // Shared state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Facebook']);
  const [outputCount, setOutputCount] = useState<1 | 2 | 3>(1);
  const [userInstruction, setUserInstruction] = useState('');

  // Quota exceeded bottom sheet
  const quotaSheetRef = useRef<BottomSheet>(null);

  const { mutate: generate, isPending } = useGenerateContent();
  const { generatedItems } = useContentStore();

  // Nhận trendId + trendTitle khi user chọn từ trang Xu hướng rồi navigate về
  React.useEffect(() => {
    if (params.trendId && params.trendTitle) {
      setSelectedTrend({
        id: Number(params.trendId),
        title: params.trendTitle,
      });
      // Tự động chuyển sang mode TrendBased khi có trend được chọn
      setMode('TrendBased');
    }
  }, [params.trendId, params.trendTitle]);

  // Reset xu hướng đã chọn mỗi khi tab được focus lại,
  // nhưng bỏ qua nếu user vừa navigate về từ trang Xu hướng (có params)
  useFocusEffect(
    useCallback(() => {
      if (!params.trendId) {
        setSelectedTrend(null);
      }
      // Reset mode theo param mỗi lần focus
      if (params.mode === 'PersonaDriven') {
        setMode('PersonaDriven');
      } else if (!params.trendId) {
        // Chỉ reset về TrendBased nếu không phải đang quay về sau khi chọn trend
        setMode('TrendBased');
      }
    }, [params.trendId, params.mode])
  );

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform];

      // Auto-sync outputCount: đảm bảo ít nhất 1 bài per platform, capped ở 3
      const synced = Math.min(Math.max(next.length, 1), 3) as 1 | 2 | 3;
      setOutputCount(synced);

      return next;
    });
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = useCallback(() => {
    if (selectedPlatforms.length === 0) return;
    if (mode === 'TrendBased' && !selectedTrend) return;

    setErrorMessage('');

    generate(
      {
        outputCount,
        language: 'vi',
        targetPlatforms: selectedPlatforms,
        generateImage: false,
        mode,
        trendId: mode === 'TrendBased' ? selectedTrend?.id : undefined,
        userInstruction: userInstruction.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          // Guard: không navigate nếu AI trả về items rỗng
          if (!response?.items || response.items.length === 0) {
            setErrorMessage('AI chưa tạo được nội dung. Vui lòng thử lại sau vài giây.');
            return;
          }
          router.push('/(tabs)/generate/result');
        },
        onError: (err) => {
          const axiosError = err as AxiosError<ApiError>;
          if (axiosError.response?.status === 429) {
            quotaSheetRef.current?.expand();
          } else {
            setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
          }
        },
      }
    );
  }, [mode, selectedTrend, selectedPlatforms, outputCount, userInstruction, generate, router]);

  const canGenerate =
    selectedPlatforms.length > 0 &&
    (mode === 'PersonaDriven' || selectedTrend !== null);

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        <View className="px-5 pt-14 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Tạo nội dung</Text>
          <Text className="text-sm text-gray-500 mt-0.5">AI sẽ tạo bài đăng phù hợp với thương hiệu của bạn</Text>
        </View>

        {/* Mode Selector */}
        <View className="px-5 mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Chế độ tạo nội dung</Text>
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            {(['TrendBased', 'PersonaDriven'] as ContentMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                className="flex-1 py-2.5 rounded-lg items-center"
                style={mode === m ? { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
                onPress={() => setMode(m)}
              >
                <Text
                  className={`text-sm font-medium ${
                    mode === m ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {m === 'TrendBased' ? 'Xu hướng' : 'Persona'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TrendBased: Banner dẫn sang trang Xu hướng */}
        {mode === 'TrendBased' && (
          <View className="px-5 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Xu hướng</Text>

            {selectedTrend ? (
              /* Đã chọn xu hướng — hiện chip + nút Đổi */
              <View className="border border-primary-300 bg-primary-50 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-xs text-primary-500 font-semibold mb-0.5">Đã chọn</Text>
                  <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
                    {selectedTrend.title}
                  </Text>
                </View>
                <TouchableOpacity
                  className="border border-gray-300 bg-white rounded-lg px-3 py-1.5"
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/trends',
                      params: { fromGenerate: '1' },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-semibold text-gray-700">Đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Chưa chọn — banner mồi dẫn sang trang Xu hướng */
              <TouchableOpacity
                className="border border-dashed border-gray-300 bg-gray-50 rounded-xl px-4 py-4 flex-row items-center justify-between"
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/trends',
                    params: { fromGenerate: '1' },
                  })
                }
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1" style={{ gap: 10 }}>
                  <View className="w-9 h-9 rounded-xl bg-gray-200 items-center justify-center">
                    <MaterialIcons name="trending-up" size={20} color="#374151" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800">Chọn xu hướng</Text>
                    <Text className="text-xs text-gray-400 mt-0.5">Xem các chủ đề đang hot để tạo nội dung</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Platform Selector */}
        <View className="px-5 mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Nền tảng đăng bài</Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {PLATFORMS.map((platform) => {
              const selected = selectedPlatforms.includes(platform);
              return (
                <TouchableOpacity
                  key={platform}
                  className={`px-3 py-2 rounded-xl border ${
                    selected
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selected ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {platform}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Output Count */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-700">Số bài đầu ra</Text>
            {selectedPlatforms.length > 1 && (
              <Text className="text-xs text-primary-500">
                1 bài / nền tảng
              </Text>
            )}
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            {OUTPUT_COUNTS.map((count) => {
              const isActive = outputCount === count;
              const isDisabled = selectedPlatforms.length > 1 && count !== outputCount;
              return (
                <TouchableOpacity
                  key={count}
                  className={`w-12 h-12 rounded-xl border items-center justify-center ${
                    isActive
                      ? 'bg-primary-500 border-primary-500'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-100'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => {
                    if (selectedPlatforms.length <= 1) setOutputCount(count);
                  }}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <Text
                    className={`text-base font-bold ${
                      isActive ? 'text-white' : isDisabled ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* User Instruction */}
        <View className="px-5 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Yêu cầu thêm{' '}
            <Text className="text-gray-400 font-normal">(tùy chọn)</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 min-h-[80px]"
            placeholder="VD: Tập trung vào đất nền ven đô, nhấn mạnh cơ hội đầu tư 2026..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            maxLength={1000}
            value={userInstruction}
            onChangeText={setUserInstruction}
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {userInstruction.length}/1000
          </Text>
        </View>

        {/* Generate Button */}
        <View className="px-5">
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              canGenerate && !isPending ? 'bg-primary-500' : 'bg-gray-200'
            }`}
            onPress={handleGenerate}
            disabled={!canGenerate || isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white font-semibold text-base">AI đang tạo nội dung...</Text>
              </View>
            ) : (
              <Text
                className={`font-semibold text-base ${
                  canGenerate ? 'text-white' : 'text-gray-400'
                }`}
              >
                Tạo nội dung
              </Text>
            )}
          </TouchableOpacity>
          {mode === 'TrendBased' && !selectedTrend && (
            <Text className="text-xs text-gray-400 text-center mt-2">
              Vui lòng chọn một xu hướng trước
            </Text>
          )}
          {errorMessage.length > 0 && (
            <View className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-center" style={{ gap: 8 }}>
              <MaterialIcons name="error-outline" size={16} color="#DC2626" />
              <Text className="text-sm text-red-600 flex-1">{errorMessage}</Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Quota Exceeded Bottom Sheet */}
      <BottomSheet
        ref={quotaSheetRef}
        index={-1}
        snapPoints={['38%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚡</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
            Bạn đã dùng hết lượt hôm nay
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
            Nâng cấp lên gói Pro để tạo thêm nội dung mỗi ngày.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#111827', borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10 }}
            onPress={() => {
              quotaSheetRef.current?.close();
              router.push('/(tabs)/profile');
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Nâng cấp ngay →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => quotaSheetRef.current?.close()}
          >
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Để sau</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
