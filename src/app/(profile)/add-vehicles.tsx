import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import VehicleSearch from "@/components/common/vehicle-search";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

export default function VehiclePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  if (!loaded) return null;

  return (
    <ScrollView className="font-[Kanit-Regular] flex-1 bg-white">
      <View className="px-6 pb-4 pt-16 flex-row items-center gap-4">
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
          {t("profile.vehicle")}
        </Text>
      </View>

      <View className="px-6 mt-6">
        <VehicleSearch
          name="pickup"
          placeholder={t("profile.enterVehicleName")}
          onSelect={() => router.push("/(profile)/vehicle-category")}
        />
      </View>
    </ScrollView>
  );
}
