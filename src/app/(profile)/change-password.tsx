import React, { useState } from "react";
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

export default function ChangePasswordPage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  if (!loaded) return null;

  const handleSave = () => {
    router.push("/(tabs)/user-profile");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="font-Kanit-Regular flex-1"
      >
        {/* Header */}
        <View className="px-6 pb-4 pt-16 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          >
            {swap(
              <ChevronLeft size={24} color="#3C3F4E" />,
              <ChevronRight size={24} color="#3C3F4E" />
            )}
          </TouchableOpacity>
          <Text
            fontSize={24}
            className={swap(
              "text-2xl text-black font-[Kanit-Medium] ml-4",
              "text-2xl text-black font-[Kanit-Medium] mr-4"
            )}
          >
            {t("profile.changePassword")}
          </Text>
        </View>
        <Text
          fontSize={14}
          className="px-6 text-sm text-[#939393] font-[Kanit-Light]"
        >
          {t("profile.passwordRequirements")}
        </Text>

        {/* Form */}
        <View className="px-6 mt-6 gap-[10px]">
          {[
            {
              value: currentPassword,
              setter: setCurrentPassword,
              placeholder: "Current password",
            },
            {
              value: newPassword,
              setter: setNewPassword,
              placeholder: "New password",
            },
            {
              value: confirmNewPassword,
              setter: setConfirmNewPassword,
              placeholder: "Confirm new password",
            },
          ].map(({ value, setter, placeholder }, idx) => (
            <View
              key={idx}
              className="flex-row items-center bg-[#F1F1F5] rounded-full px-4 h-[50px]"
            >
              <TextInput
                allowFontScaling={false}
                value={value}
                onChangeText={setter}
                placeholder={t(`profile.${placeholder.replace(/\s/g, "")}`)}
                className="flex-1 text-base font-[Kanit-Light] placeholder:text-[#757478]"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-6 inset-x-0 px-6">
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          className="bg-red-500 rounded-full h-14 items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Medium]"
          >
            {t("profile.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
