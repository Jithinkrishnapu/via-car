import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ReturnIllustration from "../../../public/return.svg";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { useRoute } from "@react-navigation/native";

export default function Page() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  if (!loaded) return null;
  const route = useRoute()

  const { ride, setSelectedPlaces, selectedPlaces, polyline } = useCreateRideStore();

  return (
    <View className="flex-1 bg-white">
      <View className="max-w-[1379px] w-full self-center px-6 pt-16 lg:pt-20 pb-12 lg:pb-24 flex flex-col gap-4 lg:gap-7">
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
            fontSize={23}
            className="text-[23px] text-black font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("returnRide.title")}
          </Text>
        </View>

        {/* Body */}
        <View className="flex-col max-w-[716px] w-full self-center">
          {/* Illustration */}
          <ReturnIllustration width="100%" height={200} />

          {/* Option: Publish Now */}
          <TouchableOpacity
            onPress={() => router.push("/(publish)/date-return")}
            activeOpacity={0.8}
            className="py-4 flex-row items-center border-b border-[#EBEBEB] border-dashed mt-8"
          >
            <Text fontSize={16} className="text-base font-[Kanit-Regular]">
              {t("returnRide.publishNow")}
            </Text>
            <ChevronRight
              size={20}
              strokeWidth={1}
              color="#000"
              className="ml-auto"
            />
          </TouchableOpacity>

          {/* Option: Later */}
          <TouchableOpacity
            onPress={() => {
              setSelectedPlaces([])
              router.push({pathname:"/(publish)/publish-ride",params:{ride_id:route?.params?.ride_id,ride_amount_id:route?.params?.ride_amount_id}}); 
              // router.push({pathname:"/(publish)/publish-ride"}); 
            }}
            activeOpacity={0.8}
            className="py-4 flex-row items-center border-b border-[#EBEBEB] border-dashed"
          >
            <Text fontSize={16} className="text-base font-[Kanit-Regular]">
              {t("returnRide.publishLater")}
            </Text>
            <ChevronRight
              size={20}
              strokeWidth={1}
              color="#000"
              className="ml-auto"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
