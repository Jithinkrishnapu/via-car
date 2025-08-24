import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

export default function RideCommentScreen() {
  const loaded = useLoadFonts();
  const [comment, setComment] = useState("");
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();

  if (!loaded) return null;

  return (
    <View className="max-w-[894px] w-full self-center px-6 pt-16 lg:pt-20 pb-12 lg:pb-24 flex flex-col gap-4 flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-4 mb-6">
        <TouchableOpacity
          className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} />
        </TouchableOpacity>
        <Text
          fontSize={25}
          className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
        >
          {t("publishComment.title")}
        </Text>
      </View>

      {/* Textarea */}
      <TextInput
        allowFontScaling={false}
        value={comment}
        onChangeText={setComment}
        placeholder={t("publishComment.placeholder")}
        placeholderTextColor="#999999"
        multiline
        className="flex-1 text-[14px] font-[Kanit-Light] bg-[#F5F5F5] rounded-2xl p-6 max-h-[200px]"
        style={{ textAlignVertical: "top", minHeight: 228, fontSize: 14 }}
      />

      {/* Publish Button */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.push("/register")}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full w-full h-[55px] items-center justify-center mt-6"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("publishComment.publish")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
