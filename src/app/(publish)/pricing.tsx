import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Pricing() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [amount, setAmount] = useState(3000);

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(1000, Math.min(4000, prev + delta)));
  };

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-lg w-full self-center pt-16 px-4 lg:px-12">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          >
            <ChevronLeft size={16} color="#3C3F4E" />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("pricing.title")}
          </Text>
        </View>

        {/* Adjuster */}
        <View className="flex-row items-center justify-center space-x-2 px-6">
          <TouchableOpacity
            onPress={() => adjustAmount(-500)}
            activeOpacity={0.8}
            disabled={amount === 1000}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <MinusLarge width={32} height={32} />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text
              fontSize={60}
              className="text-[60px] text-[#00665A] font-[Kanit-SemiBold]"
            >
              SR {amount.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => adjustAmount(500)}
            activeOpacity={0.8}
            disabled={amount === 4000}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <PlusLarge width={32} height={32} />
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View
          className="my-6"
          style={{
            borderTopWidth: 1,
            borderColor: "#CDCDCD",
            borderStyle: "dashed",
          }}
        />

        {/* Recommended Badge */}
        <View className="self-center mb-4">
          <View className="bg-[#14B968] rounded-full px-6 py-1">
            <Text
              fontSize={12}
              className="text-[12px] lg:text-lg text-white font-[Kanit-Light]"
            >
              {t("pricing.recommended")}
            </Text>
          </View>
        </View>

        <Text
          fontSize={12}
          className="text-[12px] lg:text-base text-[#666666] font-[Kanit-Light] text-center"
        >
          {t("pricing.hint")}
        </Text>
      </View>

      {/* Footer Buttons */}
      <View className="absolute bottom-8 left-0 right-0 px-6 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/show-pricing")}
          activeOpacity={0.8}
          className="flex-1 rounded-full h-[55px] border border-[#EBEBEB] items-center justify-center"
        >
          <Text fontSize={20} className="text-xl font-[Kanit-Regular]">
            {t("pricing.showPrices")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(publish)/return")}
          activeOpacity={0.8}
          className="flex-1 rounded-full h-[55px] bg-[#FF4848] items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Pricing;
