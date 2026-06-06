import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePersona, useUpdatePersona } from '@/features/persona/hooks';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { UpdatePersonaRequest } from '@/types/api';

// ─── TagInput Component ───────────────────────────────────────────────────────

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

function TagInput({ label, tags, onTagsChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </Text>

      {/* Tag list */}
      <View className="flex-row flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <View key={idx} className="flex-row items-center bg-primary-50 px-3 py-1.5 rounded-full">
            <Text className="text-sm text-primary-700 mr-1">{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
              <Text className="text-primary-500 font-bold">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Input */}
      <View className="flex-row gap-2">
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder ?? 'Nhập và nhấn Thêm'}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
        <Button variant="primary" size="sm" onPress={handleAddTag}>
          Thêm
        </Button>
      </View>
    </View>
  );
}

// ─── PersonaScreen ────────────────────────────────────────────────────────────

export default function PersonaScreen() {
  const router = useRouter();
  const { data: persona, isLoading } = usePersona();
  const { mutate: updateMutate, isPending: isSaving } = useUpdatePersona();

  const [jobTitle, setJobTitle] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [language, setLanguage] = useState('vi');
  const [platformPreferences, setPlatformPreferences] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [contentFormats, setContentFormats] = useState<string[]>([]);
  const [negativeConstraints, setNegativeConstraints] = useState<string[]>([]);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Pre-fill form khi persona load
  useEffect(() => {
    if (persona) {
      setJobTitle(persona.jobTitle ?? '');
      setToneOfVoice(persona.toneOfVoice ?? '');
      setLanguage(persona.language ?? 'vi');
      setPlatformPreferences(persona.platformPreferences ?? []);
      setTargetAudience(persona.targetAudience ?? []);
      setContentFormats(persona.contentFormats ?? []);
      setNegativeConstraints(persona.negativeConstraints ?? []);
    }
  }, [persona]);

  const handleSave = useCallback(() => {
    // Chỉ gửi fields đã thay đổi
    const updates: UpdatePersonaRequest = {};

    if (jobTitle !== persona?.jobTitle) updates.jobTitle = jobTitle;
    if (toneOfVoice !== persona?.toneOfVoice) updates.toneOfVoice = toneOfVoice;
    if (language !== persona?.language) updates.language = language;

    if (JSON.stringify(platformPreferences) !== JSON.stringify(persona?.platformPreferences)) {
      updates.platformPreferences = platformPreferences;
    }
    if (JSON.stringify(targetAudience) !== JSON.stringify(persona?.targetAudience)) {
      updates.targetAudience = targetAudience;
    }
    if (JSON.stringify(contentFormats) !== JSON.stringify(persona?.contentFormats)) {
      updates.contentFormats = contentFormats;
    }
    if (JSON.stringify(negativeConstraints) !== JSON.stringify(persona?.negativeConstraints)) {
      updates.negativeConstraints = negativeConstraints;
    }

    if (Object.keys(updates).length === 0) {
      showToast('Không có thay đổi nào', 'error');
      return;
    }

    updateMutate(updates, {
      onSuccess: () => {
        showToast('Đã lưu persona');
      },
      onError: () => {
        showToast('Lưu thất bại, thử lại sau', 'error');
      },
    });
  }, [
    jobTitle,
    toneOfVoice,
    language,
    platformPreferences,
    targetAudience,
    contentFormats,
    negativeConstraints,
    persona,
    updateMutate,
    showToast,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3"
        >
          <Text className="text-primary-500 text-base font-medium">← Quay lại</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Persona thương hiệu</Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        {/* Job Title */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Ngành nghề / Vai trò
          </Text>
          <TextInput
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="VD: Chuyên viên Marketing BĐS"
            className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800"
          />
        </View>

        {/* Tone of Voice */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Phong cách viết
          </Text>
          <TextInput
            value={toneOfVoice}
            onChangeText={setToneOfVoice}
            placeholder="VD: Thân thiện, chuyên nghiệp, hài hước"
            multiline
            numberOfLines={3}
            className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800"
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
        </View>

        {/* Language */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Ngôn ngữ
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setLanguage('vi')}
              className={`flex-1 py-3 rounded-xl border ${
                language === 'vi'
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  language === 'vi' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                Tiếng Việt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-xl border ${
                language === 'en'
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  language === 'en' ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Preferences */}
        <TagInput
          label="Nền tảng ưa thích"
          tags={platformPreferences}
          onTagsChange={setPlatformPreferences}
          placeholder="VD: Facebook, Instagram"
        />

        {/* Target Audience */}
        <TagInput
          label="Đối tượng mục tiêu"
          tags={targetAudience}
          onTagsChange={setTargetAudience}
          placeholder="VD: Doanh nghiệp SME, Gen Z"
        />

        {/* Content Formats */}
        <TagInput
          label="Định dạng nội dung"
          tags={contentFormats}
          onTagsChange={setContentFormats}
          placeholder="VD: Video ngắn, Infographic"
        />

        {/* Negative Constraints */}
        <TagInput
          label="Ràng buộc nội dung (tránh)"
          tags={negativeConstraints}
          onTagsChange={setNegativeConstraints}
          placeholder="VD: Không dùng từ ngữ tiêu cực"
        />

        {/* Save button */}
        <View className="mt-4">
          <Button variant="primary" onPress={handleSave} loading={isSaving}>
            Lưu thay đổi
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
