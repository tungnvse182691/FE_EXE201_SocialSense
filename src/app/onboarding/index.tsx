import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { submitOnboarding, getPersona } from '@/features/persona/api';
import type { PersonaProfile } from '@/types/api';

const QUESTIONS = [
  {
    id: 1,
    title: 'Ngành nghề của bạn',
    placeholder: 'VD: Tôi là môi giới bất động sản chuyên phân khúc căn hộ cao cấp tại TP.HCM, 5 năm kinh nghiệm.',
    hint: 'Mô tả công việc, lĩnh vực và kinh nghiệm của bạn',
  },
  {
    id: 2,
    title: 'Khách hàng mục tiêu',
    placeholder: 'VD: Nhà đầu tư 35-55 tuổi, thu nhập cao, quan tâm sinh lời và an toàn tài sản.',
    hint: 'Ai là người bạn muốn tiếp cận qua nội dung?',
  },
  {
    id: 3,
    title: 'Nền tảng & tần suất đăng bài',
    placeholder: 'VD: Tôi muốn đăng Facebook và Zalo hàng ngày, dạng phân tích thị trường và review dự án.',
    hint: 'Bạn dùng mạng xã hội nào và đăng bao nhiêu lần/tuần?',
  },
  {
    id: 4,
    title: 'Phong cách viết',
    placeholder: 'VD: Chuyên nghiệp nhưng gần gũi, tạo cảm giác tin tưởng, dùng số liệu thực tế.',
    hint: 'Tone of voice bạn muốn thể hiện trong nội dung',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasContext } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(4).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persona, setPersona] = useState<PersonaProfile | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const question = QUESTIONS[currentStep];
  const filledAnswers = answers.filter((a) => a.trim().length > 0).length;
  const canSubmit = filledAnswers >= 3;
  const isLastStep = currentStep === QUESTIONS.length - 1;

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Cần thêm thông tin', 'Vui lòng trả lời ít nhất 3 câu hỏi để AI có thể xây dựng persona cho bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const filledOnly = answers.filter((a) => a.trim().length > 0);
      await submitOnboarding({ language: 'vi', answers: filledOnly });
      const fetchedPersona = await getPersona();
      setPersona(fetchedPersona);
      setShowConfirmation(true);
    } catch {
      Alert.alert('Lỗi', 'Không thể xử lý thông tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    setHasContext(true);
    router.replace('/(tabs)');
  };

  // ── Persona Confirmation Screen ──────────────────────────────────────────
  if (showConfirmation && persona) {
    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-14 pb-8">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900 text-center">
              AI đã xây dựng persona của bạn 🎉
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Xem lại và xác nhận để bắt đầu tạo nội dung
            </Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 gap-3 mb-6">
            <PersonaRow label="Nghề nghiệp" value={persona.jobTitle} />
            <PersonaRow label="Phong cách" value={persona.toneOfVoice} />
            <PersonaRow
              label="Nền tảng"
              value={persona.platformPreferences.join(', ')}
            />
            <PersonaRow
              label="Khách hàng"
              value={persona.targetAudience.join(' • ')}
            />
            <PersonaRow
              label="Định dạng"
              value={persona.contentFormats.join(', ')}
            />
            {persona.negativeConstraints.length > 0 && (
              <PersonaRow
                label="Ràng buộc"
                value={persona.negativeConstraints.join(' • ')}
              />
            )}
          </View>

          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 items-center"
            onPress={handleConfirm}
          >
            <Text className="text-white font-semibold text-base">
              Xác nhận & Bắt đầu tạo nội dung →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Question Steps ────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-white">
      {/* Progress Bar */}
      <View className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm text-gray-500">
            Bước {currentStep + 1}/{QUESTIONS.length}
          </Text>
          <Text className="text-sm text-gray-500">
            {filledAnswers}/3 câu tối thiểu
          </Text>
        </View>
        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
      >
        <View>
          {/* Question */}
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {question.title}
          </Text>
          <Text className="text-sm text-gray-500 mb-4">{question.hint}</Text>

          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50 min-h-[120px]"
            placeholder={question.placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={answers[currentStep]}
            onChangeText={(text) => {
              const updated = [...answers];
              updated[currentStep] = text;
              setAnswers(updated);
            }}
          />

          {/* Step dots */}
          <View className="flex-row justify-center gap-2 mt-6">
            {QUESTIONS.map((_, i) => (
              <View
                key={i}
                className={`h-2 rounded-full ${
                  i === currentStep
                    ? 'w-6 bg-primary-500'
                    : answers[i].trim()
                    ? 'w-2 bg-primary-300'
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Navigation Buttons */}
      <View
        className="px-6 pt-4 flex-row gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        {currentStep > 0 && (
          <TouchableOpacity
            className="flex-1 border border-gray-200 rounded-xl py-4 items-center"
            onPress={handleBack}
          >
            <Text className="text-gray-700 font-semibold">← Quay lại</Text>
          </TouchableOpacity>
        )}

        {isLastStep ? (
          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 items-center ${
              canSubmit ? 'bg-primary-500' : 'bg-gray-200'
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={canSubmit ? '#FFFFFF' : '#9CA3AF'} />
            ) : (
              <Text
                className={`font-semibold text-base ${
                  canSubmit ? 'text-white' : 'text-gray-400'
                }`}
              >
                Hoàn thành ✓
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
            onPress={handleNext}
          >
            <Text className="text-white font-semibold text-base">Tiếp theo →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function PersonaRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </Text>
      <Text className="text-sm text-gray-800">{value}</Text>
    </View>
  );
}
