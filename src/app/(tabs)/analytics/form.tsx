import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCompare, useAnalyze, useUploadAndCompare } from '@/features/analytics/hooks';
import { getTemplateUrl } from '@/features/analytics/api';
import type { AnalyticsPlatform, AnalyticsMetrics } from '@/types/api';

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORMS: AnalyticsPlatform[] = ['TikTok', 'Facebook', 'Instagram', 'YouTube'];

interface FieldDef {
  key: keyof Omit<AnalyticsMetrics, 'platform' | 'periodLabel'>;
  label: string;
  unit?: string;
  placeholder?: string;
  onlyFor?: AnalyticsPlatform[];
}

const FIELDS: FieldDef[] = [
  { key: 'reach',                  label: 'Tổng tiếp cận',           placeholder: 'VD: 482300' },
  { key: 'impressions',            label: 'Lượt hiển thị',           placeholder: 'VD: 950000' },
  { key: 'totalEngagement',        label: 'Tổng tương tác',          placeholder: 'VD: 89700' },
  { key: 'likes',                  label: 'Lượt thích',              placeholder: 'VD: 71760' },
  { key: 'comments',               label: 'Bình luận',               placeholder: 'VD: 8970' },
  { key: 'shares',                 label: 'Lượt chia sẻ',            placeholder: 'VD: 4485' },
  { key: 'clicks',                 label: 'Lượt click',              placeholder: 'VD: 14352' },
  { key: 'newFollowers',           label: 'Người theo dõi mới',      placeholder: 'VD: 2340' },
  { key: 'profileVisits',          label: 'Lượt xem trang cá nhân', placeholder: 'VD: 9646' },
  { key: 'engagementRate',         label: 'Tỉ lệ tương tác',         unit: '%', placeholder: 'VD: 18.6' },
  { key: 'completionRate',         label: 'Tỷ lệ hoàn thành',        unit: '%', placeholder: 'VD: 72.4', onlyFor: ['TikTok', 'YouTube', 'Instagram'] },
  { key: 'avgViewDurationSeconds', label: 'Thời gian xem TB',        unit: 'giây', placeholder: 'VD: 108', onlyFor: ['TikTok', 'YouTube'] },
  { key: 'conversionRate',         label: 'Tỷ lệ chuyển đổi',       unit: '%', placeholder: 'VD: 3.2' },
  { key: 'clickThroughRate',       label: 'Tỷ lệ nhấp (CTR)',        unit: '%', placeholder: 'VD: 2.9' },
  { key: 'postsCount',             label: 'Số bài đăng',             placeholder: 'VD: 28' },
];

type FormValues = Partial<Record<keyof Omit<AnalyticsMetrics, 'platform' | 'periodLabel'>, string>>;
type Mode = 'single' | 'compare' | 'upload';

function formToMetrics(
  platform: AnalyticsPlatform,
  periodLabel: string,
  values: FormValues
): AnalyticsMetrics {
  const metrics: AnalyticsMetrics = { platform, periodLabel };
  for (const field of FIELDS) {
    const raw = values[field.key];
    if (raw && raw.trim() !== '') {
      const num = parseFloat(raw.replace(/,/g, ''));
      if (!isNaN(num)) (metrics as any)[field.key] = num;
    }
  }
  return metrics;
}

// ─── Sub: Period Form — layout 2 cột gọn ─────────────────────────────────────

function PeriodForm({
  title,
  platform,
  periodLabel,
  onPeriodLabelChange,
  values,
  onValueChange,
}: {
  title: string;
  platform: AnalyticsPlatform;
  periodLabel: string;
  onPeriodLabelChange: (v: string) => void;
  values: FormValues;
  onValueChange: (key: keyof FormValues, value: string) => void;
}) {
  const visibleFields = FIELDS.filter((f) => !f.onlyFor || f.onlyFor.includes(platform));

  // Chia thành pairs để render 2 cột
  const pairs: (FieldDef | null)[][] = [];
  for (let i = 0; i < visibleFields.length; i += 2) {
    pairs.push([visibleFields[i], visibleFields[i + 1] ?? null]);
  }

  return (
    <View className="mx-5 mt-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <Text className="text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2.5 border-b border-gray-100 dark:border-gray-600">
        {title}
      </Text>

      {/* Tên kỳ — full width */}
      <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
          <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400" style={{ width: 110 }}>
            Tên kỳ báo cáo <Text className="text-red-400">*</Text>
          </Text>
          <View className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5">
            <TextInput
              className="text-sm text-gray-900 dark:text-white"
              value={periodLabel}
              onChangeText={onPeriodLabelChange}
              placeholder='VD: "T6/2026"'
              placeholderTextColor="#D1D5DB"
            />
          </View>
        </View>
      </View>

      {/* Grid 2 cột */}
      {pairs.map((pair, rowIdx) => (
        <View
          key={rowIdx}
          className="flex-row border-b border-gray-50 dark:border-gray-700"
        >
          {pair.map((field, colIdx) => (
            <View
              key={field?.key ?? `empty-${colIdx}`}
              className={`flex-1 px-3 py-2.5 ${colIdx === 0 ? 'border-r border-gray-100 dark:border-gray-700' : ''}`}
            >
              {field ? (
                <>
                  {/* Label */}
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1" numberOfLines={1}>
                    {field.label}
                    {field.unit ? <Text className="text-gray-400"> ({field.unit})</Text> : null}
                  </Text>
                  {/* Input ô màu cam */}
                  <View className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5">
                    <TextInput
                      className="text-sm text-gray-900 dark:text-white"
                      value={values[field.key] ?? ''}
                      onChangeText={(v) => onValueChange(field.key, v)}
                      placeholder={field.placeholder?.replace('VD: ', '') ?? ''}
                      placeholderTextColor="#D1D5DB"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Sub: Upload Panel ────────────────────────────────────────────────────────

function UploadPanel({
  pickedFile,
  onPickFile,
  onDownloadTemplate,
}: {
  pickedFile: { name: string } | null;
  onPickFile: () => void;
  onDownloadTemplate: () => void;
}) {
  return (
    <View className="mx-5 mt-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4" style={{ gap: 16 }}>
      {/* Step 1 */}
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white items-center justify-center mt-0.5">
          <Text className="text-white dark:text-gray-900 text-xs font-bold">1</Text>
        </View>
        <View className="flex-1" style={{ gap: 4 }}>
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            Tải file template Excel
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 leading-5">
            Điền số liệu vào 2 sheet "Kỳ này" và "Kỳ trước" rồi lưu lại.
          </Text>
          <TouchableOpacity
            className="flex-row items-center self-start mt-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            style={{ gap: 6 }}
            onPress={onDownloadTemplate}
          >
            <MaterialIcons name="file-download" size={15} color="#374151" />
            <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tải template (.xlsx)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />

      {/* Step 2 */}
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white items-center justify-center mt-0.5">
          <Text className="text-white dark:text-gray-900 text-xs font-bold">2</Text>
        </View>
        <View className="flex-1" style={{ gap: 4 }}>
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            Chọn file đã điền
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Chỉ nhận file .xlsx, tối đa 5MB.
          </Text>
          <TouchableOpacity
            className="flex-row items-center mt-1.5 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            style={{ gap: 8 }}
            onPress={onPickFile}
          >
            <MaterialIcons
              name={pickedFile ? 'check-circle-outline' : 'attach-file'}
              size={18}
              color="#374151"
            />
            <Text
              className="text-sm text-gray-700 dark:text-gray-300 flex-1 font-medium"
              numberOfLines={1}
            >
              {pickedFile ? pickedFile.name : 'Chọn file từ thiết bị'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-start bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3" style={{ gap: 6 }}>
        <MaterialIcons name="info-outline" size={13} color="#9CA3AF" style={{ marginTop: 1 }} />
        <Text className="text-xs text-gray-400 dark:text-gray-500 flex-1 leading-5">
          Sheet "Kỳ này" = kỳ mới hơn, "Kỳ trước" = kỳ cũ. Để trống ô = AI bỏ qua chỉ số đó.
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AnalyticsFormScreen() {
  const router = useRouter();
  const { mutateAsync: compare,          isPending: compareLoading  } = useCompare();
  const { mutateAsync: analyze,          isPending: analyzeLoading  } = useAnalyze();
  const { mutateAsync: uploadAndCompare, isPending: uploadLoading   } = useUploadAndCompare();

  const [mode, setMode]         = useState<Mode>('compare');
  const [platform, setPlatform] = useState<AnalyticsPlatform>('TikTok');
  const [labelA, setLabelA]     = useState('');
  const [valuesA, setValuesA]   = useState<FormValues>({});
  const [labelB, setLabelB]     = useState('');
  const [valuesB, setValuesB]   = useState<FormValues>({});
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLabelA('');
      setValuesA({});
      setLabelB('');
      setValuesB({});
      setPickedFile(null);
    }, [])
  );

  const isLoading = compareLoading || analyzeLoading || uploadLoading;

  const updateA = useCallback((key: keyof FormValues, value: string) => {
    setValuesA((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateB = useCallback((key: keyof FormValues, value: string) => {
    setValuesB((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Alert.alert('File quá lớn', 'Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn file. Vui lòng thử lại.');
    }
  };

  const handleDownloadTemplate = () => {
    Linking.openURL(getTemplateUrl()).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở link tải template.');
    });
  };

  const handleSubmit = async () => {
    try {
      let result;
      if (mode === 'upload') {
        if (!pickedFile) {
          Alert.alert('Chưa chọn file', 'Vui lòng chọn file Excel đã điền số liệu.');
          return;
        }
        result = await uploadAndCompare(pickedFile);
      } else if (mode === 'single') {
        if (!labelA.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên kỳ báo cáo.');
          return;
        }
        result = await analyze({ metrics: formToMetrics(platform, labelA.trim(), valuesA) });
      } else {
        if (!labelA.trim() || !labelB.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên cả 2 kỳ báo cáo.');
          return;
        }
        result = await compare({
          periodA: formToMetrics(platform, labelA.trim(), valuesA),
          periodB: formToMetrics(platform, labelB.trim(), valuesB),
        });
      }
      router.push(`/(tabs)/analytics/result?id=${result.id}` as any);
    } catch (err: any) {
      const status = err?.response?.status;
      const code   = err?.response?.data?.code;
      if (status === 429)                      Alert.alert('Hết quota', 'Bạn đã dùng hết lượt hôm nay. Nâng cấp gói để phân tích thêm.');
      else if (code === 'INVALID_FILE_FORMAT') Alert.alert('Sai định dạng', 'Chỉ nhận file .xlsx.');
      else if (code === 'FILE_TOO_LARGE')      Alert.alert('File quá lớn', 'File tối đa 5MB.');
      else if (code === 'PARSE_ERROR')         Alert.alert('Không đọc được file', 'File bị lỗi hoặc sai cấu trúc. Hãy dùng đúng template.');
      else                                     Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const submitLabel =
    mode === 'upload' ? 'Phân tích file Excel'
    : mode === 'single' ? 'Phân tích 1 kỳ'
    : 'So sánh & Phân tích';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header — pattern giống persona.tsx */}
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/analytics' as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3"
        >
          <Text className="text-primary-500 text-base font-medium">← Quay lại</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
          Phân tích mới
        </Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        {/* Mode toggle */}
        <View className="mx-5 mt-4 flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1" style={{ gap: 3 }}>
          {(['single', 'compare', 'upload'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              className={`flex-1 py-2 rounded-lg items-center ${
                mode === m ? 'bg-white dark:bg-gray-600' : ''
              }`}
              style={mode === m ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 } : undefined}
              onPress={() => setMode(m)}
            >
              <Text
                className={`text-xs font-medium text-center ${
                  mode === m
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {m === 'single' ? 'Phân tích 1 kỳ' : m === 'compare' ? 'So sánh 2 kỳ' : 'Upload Excel'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'upload' ? (
          <UploadPanel
            pickedFile={pickedFile}
            onPickFile={handlePickFile}
            onDownloadTemplate={handleDownloadTemplate}
          />
        ) : (
          <>
            {/* Platform selector */}
            <View className="px-5 mt-4">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nền tảng
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {PLATFORMS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    className={`px-3 py-2 rounded-xl border ${
                      platform === p
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                    }`}
                    onPress={() => setPlatform(p)}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        platform === p ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <PeriodForm
              title={mode === 'compare' ? 'Kỳ này (mới hơn)' : 'Số liệu kỳ báo cáo'}
              platform={platform}
              periodLabel={labelA}
              onPeriodLabelChange={setLabelA}
              values={valuesA}
              onValueChange={updateA}
            />

            {mode === 'compare' && (
              <PeriodForm
                title="Kỳ trước (cũ hơn)"
                platform={platform}
                periodLabel={labelB}
                onPeriodLabelChange={setLabelB}
                values={valuesB}
                onValueChange={updateB}
              />
            )}
          </>
        )}

        {/* Quota note */}
        <View className="flex-row items-center mx-5 mt-4 gap-1.5">
          <MaterialIcons name="info-outline" size={13} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 dark:text-gray-500 flex-1">
            Mỗi lần phân tích trừ 1 quota · AI có thể mất 20–30 giây
          </Text>
        </View>

        {/* Submit — style giống Generate screen */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              !isLoading ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-white font-semibold text-base">Đang phân tích...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-base">{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
