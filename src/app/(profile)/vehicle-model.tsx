import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ModelSearch from "@/components/common/model-search";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useStore } from "@/store/useStore";

export default function VehiclePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { swap } = useDirection();
  const { vehicle } = useStore();
  
  if (!loaded) return null;

  // Debug: Log vehicle state
  console.log("Vehicle state in model page:", vehicle);

  // Check if we have required data
  if (!vehicle.brand_id || !vehicle.category_id) {
    console.warn("Missing brand_id or category_id, redirecting to category selection");
    // Optionally redirect back to category selection
    // router.replace("/(profile)/vehicle-category");
  }

  const handleModelSelect = (value: string) => {
    console.log("Model selected, navigating to color page:", value);
    console.log("Current vehicle state:", vehicle);
    router.push("/(profile)/vehicle-color");
  };

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
          {t("profile.vehicleModel")}
        </Text>
      </View>

      <View className="px-6 mt-6">
        {!vehicle.brand_id || !vehicle.category_id ? (
          <View className="bg-yellow-100 p-4 rounded-lg mb-4">
            <Text fontSize={14} className="text-yellow-800">
              Please select a vehicle brand and category first before choosing a model.
            </Text>
          </View>
        ) : null}
        
        <ModelSearch
          name="pickup"
          placeholder={t("profile.enterVehicleName")}
          onSelect={handleModelSelect}
        />
      </View>
    </ScrollView>
  );
}
