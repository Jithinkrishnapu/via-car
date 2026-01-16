import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";

export default function Page() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [passengers, setPassengers] = useState(3);

  const {setRideField} = useCreateRideStore()

  const adjustPassengers = (delta: number) => {
    setPassengers((prev) => Math.max(1, Math.min(9, prev + delta)));
  };

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-lg w-full self-center pt-16 pb-12 px-6">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
          </TouchableOpacity>
          <Text fontSize={23} className="text-[23px] font-[Kanit-Medium] flex-1">
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
            disabled={passengers === 9}
            className="w-[32px] h-[32px] rounded-full items-center justify-center"
          >
            <PlusLarge width={32} height={32} />
          </TouchableOpacity>
        </View>

        {/* Continue */}
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => {
            setRideField("available_seats",passengers)
            router.push("/(publish)/pricing")}}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
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
