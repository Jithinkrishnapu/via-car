import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ColorSearch from "@/components/common/color-search";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

export default function VehiclePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  if (!loaded) return null;

  return (
    <View className="font-[Kanit-Regular] flex-1 bg-white relative">
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
          {t("profile.vehicleColor")}
        </Text>
      </View>

      <View className="px-6 mt-6">
        <ColorSearch
          name="pickup"
          placeholder={t("profile.enterVehicleName")}
          onSelect={() => {}}
        />
      </View>
      <View className="absolute inset-x-0 bottom-10 px-6">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/user-profile")}
          activeOpacity={0.8}
          className="bg-red-500 h-14 rounded-full flex-row items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("profile.add")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
