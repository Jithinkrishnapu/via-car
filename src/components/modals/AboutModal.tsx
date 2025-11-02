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
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-white h-[40%] px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center"
    >
      {/* Close icon --------------------------------------------------- */}
      {isClosable && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className="rounded-full absolute right-8 top-8 items-center justify-center"
        >
          <X color="#000" />
        </TouchableOpacity>
      )}

      {/* Title -------------------------------------------------------- */}
      <View className="flex-1 w-full">
        <Text className="text-base font-KanitMedium text-center mb-5">
          {t('profile.aboutMe', 'About Me')}
        </Text>

        {/* Input ------------------------------------------------------ */}
        <View className="bg-neutral-100 w-full h-[120px] rounded-lg px-4 py-3">
          <TextInput
            multiline
            numberOfLines={5}
            value={input}
            onChangeText={setInput}
            placeholder={t('profile.aboutPlaceholder', 'Enter about yourself')}
            placeholderClassName="text-sm font-KanitLight text-neutral-500"
            className="flex-1 text-sm font-KanitLight"
          />
        </View>

        {/* Error hint */}
        {error && (
          <Text className="text-red-500 text-xs mt-2">{error}</Text>
        )}
      </View>

      {/* CTA ---------------------------------------------------------- */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={isLoading}
        activeOpacity={0.8}
        className={`rounded-full w-full h-[50px] items-center justify-center ${
          isLoading ? 'bg-neutral-400' : 'bg-[#FF4848]'
        }`}
      >
        <Text className="text-white text-sm font-KanitRegular text-center">
          {isLoading ? t('common.saving', 'Saving…') : buttonLabel}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default memo(AboutModal);