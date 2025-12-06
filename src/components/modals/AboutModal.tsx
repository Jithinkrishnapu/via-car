// components/modals/AboutModal.tsx
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useGetProfileDetails } from '@/service/auth';
import { useUpdateProfileDetails } from '@/service/profile';
import Text from '../common/text';

type UserProfile = { about?: string }; // extend when you have more fields

type Props = {
  onClose?: () => void;
  isClosable?: boolean; // renamed to be clearer
};

const AboutModal = ({ onClose, isClosable = true }: Props) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  /* ------------------------------------------------------------------ */
  /* 1. Fetch existing profile                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await useGetProfileDetails();
        if (!aborted && res?.data) {
          setProfile(res.data);
          setInput(res.data.about ?? '');
        }
      } catch {
        if (!aborted) setError(t('profile.loadError', 'Could not load data'));
      }
    })();
    return () => {
      aborted = true;
    };
  }, [t]);

  /* ------------------------------------------------------------------ */
  /* 2. Save new “about” text                                           */
  /* ------------------------------------------------------------------ */
  const handleSave = useCallback(async () => {
    if (!input.trim()) return;
    setError(null);
    setIsLoading(true);

    const previous = profile?.about;
    const next = input.trim();

    // optimistic update
    setProfile((p) => (p ? { ...p, about: next } : { about: next }));
    setInput('');

    try {
      const form = new FormData();
      form.append('about', next);
      await useUpdateProfileDetails(form);
      onClose?.();
    } catch {
      setError(t('profile.saveError', 'Could not save'));
      // roll-back
      setProfile((p) => (p ? { ...p, about: previous } : { about: previous }));
      setInput(next);
    } finally {
      setIsLoading(false);
    }
  }, [input, profile?.about, onClose, t]);

  /* ------------------------------------------------------------------ */
  /* 3. Clean-up on un-mount                                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    return () => Keyboard.dismiss();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 4. UI                                                              */
  /* ------------------------------------------------------------------ */
  const buttonLabel = useMemo(
    () => (isClosable ? t('profile.save') : t('profile.backToPublish')),
    [isClosable, t]
  );

  return (
    <View className="bg-white h-[50%] rounded-t-3xl">
      {/* Close icon --------------------------------------------------- */}
      {isClosable && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className="rounded-full absolute right-8 top-8 items-center justify-center z-10"
        >
          <X color="#000" />
        </TouchableOpacity>
      )}

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 48,
          paddingTop: 48,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
        extraHeight={150}
      >
        {/* Title -------------------------------------------------------- */}
        <Text className="text-base font-[Kanit-Medium] text-center mb-5">
          {t('profile.aboutMe', 'About Me')}
        </Text>

        {/* Input ------------------------------------------------------ */}
        <View className="bg-neutral-100 w-full min-h-[120px] rounded-lg px-4 py-3 mb-4">
          <TextInput
            multiline
            numberOfLines={5}
            value={input}
            onChangeText={setInput}
            placeholder={t('profile.aboutPlaceholder', 'Enter about yourself')}
            placeholderTextColor="#9ca3af"
            className="flex-1 text-sm font-[Kanit-Light]"
            textAlignVertical="top"
          />
        </View>

        {/* Error hint */}
        {error && (
          <Text className="text-red-500 text-xs mb-4">{error}</Text>
        )}

        {/* CTA ---------------------------------------------------------- */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
          className={`rounded-full w-full h-[50px] items-center justify-center mt-2 ${
            isLoading ? 'bg-neutral-400' : 'bg-[#FF4848]'
          }`}
        >
          <Text className="text-white text-sm font-[Kanit-Regular] text-center">
            {isLoading ? t('common.saving', 'Saving…') : buttonLabel}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default memo(AboutModal);