import { useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { ChevronLeft, Circle } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";
import People from "../../../public/people.svg";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

export default function Page() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [passengers, setPassengers] = useState(3);
  const [comfortMode, setComfortMode] = useState(false);

  const adjustPassengers = (delta: number) => {
    setPassengers((prev) => Math.max(1, Math.min(3, prev + delta)));
  };

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-lg w-full self-center pt-16 pb-12">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6 px-6">
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
            {t("passengerCount.title")}
          </Text>
        </View>

        {/* Passenger Adjuster */}
        <View className="flex-row items-center justify-center space-x-2 px-6 mb-4">
          <TouchableOpacity
            onPress={() => adjustPassengers(-1)}
            activeOpacity={0.8}
            disabled={passengers === 1}
            className="w-[32px] h-[32px] rounded-full items-center justify-center"
          >
            <MinusLarge width={32} height={32} />
          </TouchableOpacity>

          <View className="flex-1 items-center py-4">
            <Text
              fontSize={60}
              className="text-[60px] text-[#00665A] font-[Kanit-SemiBold]"
            >
              {passengers.toString().padStart(2, "0")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => adjustPassengers(1)}
            activeOpacity={0.8}
            disabled={passengers === 3}
            className="w-[32px] h-[32px] rounded-full items-center justify-center"
          >
            <PlusLarge width={32} height={32} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {/* Comfort Mode Checkbox */}
          <Text
            fontSize={18}
            className="text-[18px] text-black font-[Kanit-Regular] mb-[15px]"
          >
            {t("passengerCount.options")}
          </Text>
          <TouchableOpacity
            onPress={() => setComfortMode((prev) => !prev)}
            activeOpacity={0.8}
            className="flex-row items-center gap-4 w-full border border-[#EBEBEB] rounded-2xl px-4 py-4 mb-8"
          >
            <People width={20} height={20} />
            <View className="flex-1">
              <Text
                fontSize={14}
                className="text-sm lg:text-base font-[Kanit-Regular]"
              >
                {t("passengerCount.maxTwoInBack")}
              </Text>
              <Text
                fontSize={12}
                className="text-xs lg:text-[0.938rem] text-[#666666] font-[Kanit-Light]"
              >
                {t("passengerCount.comfortHint")}
              </Text>
            </View>
            {comfortMode ? (
              <CheckGreen width={25} height={25} />
            ) : (
              <Circle
                color="#BBBBBB"
                width={25}
                height={25}
                strokeWidth={1}
                className="size-[25px]"
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-[15px] border-t-[7px] border-[#F7F7F7]">
          <Text fontSize={18} className="text-[18px] mb-6 font-[Kanit-Regular]">
            {t("publishComment.title")}
          </Text>
          <TextInput
            allowFontScaling={false}
            placeholder={t("publishComment.placeholder")}
            placeholderTextColor="#999999"
            multiline
            className="flex-1 text-[14px] font-[Kanit-Light] bg-[#F5F5F5] rounded-2xl p-6 max-h-[200px]"
            style={{ textAlignVertical: "top", minHeight: 228, fontSize: 14 }}
          />
        </View>

        {/* Continue */}
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
