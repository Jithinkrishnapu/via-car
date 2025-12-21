import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ColorSearch from "@/components/common/color-search";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { addVehicle } from "@/service/vehicle";
import { useStore } from "@/store/useStore";
import { handleApiError } from "@/utils/apiErrorHandler";

export default function VehiclePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const { vehicle_model_id, path } = useStore();
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);

  if (!loaded) return null;

  const handleAddVehicle = async () => {
    if (!selectedColor.trim()) {
      Alert.alert(t("error"), t("profile.pleaseSelectColor"));
      return;
    }

    if (!vehicle_model_id) {
      Alert.alert(t("error"), t("profile.vehicleModelRequired"));
      return;
    }

    try {
      setLoading(true);
      const formdata = new FormData();
      formdata.append("model_id", vehicle_model_id.toString());
      formdata.append("color", selectedColor.trim());
      formdata.append("year", "2021");

      const response = await addVehicle(formdata);
      console.log("Add vehicle response:", response);

      if (response?.ok) {
        Alert.alert(
          t("success"),
          t("profile.vehicleAddedSuccessfully"),
          [
            {
              text: t("ok"),
              onPress: () => {
                // Navigate to the specified path or default to home
                if (typeof path === "string" && path.startsWith("/")) {
                  router.replace(path as any);
                } else {
                  router.replace("/");
                }
              }
            }
          ]
        );
      } else {
        // Handle non-ok response
        Alert.alert(t("error"), t("profile.failedToAddVehicle"));
      }
    } catch (error: any) {
      console.error("Add vehicle error:", error);
      handleApiError(error, "Add Vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="font-[Kanit-Regular] flex-1 bg-white relative">
      <View className="px-6 pb-4 pt-16 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          disabled={loading}
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
          onSelect={(value) => setSelectedColor(value)}
          disabled={loading}
        />
      </View>
      
      <View className="absolute inset-x-0 bottom-10 px-6">
        <TouchableOpacity
          onPress={handleAddVehicle}
          activeOpacity={0.8}
          disabled={loading || !selectedColor.trim()}
          className={`h-14 rounded-full flex-row items-center justify-center ${
            loading || !selectedColor.trim() 
              ? 'bg-gray-400' 
              : 'bg-red-500'
          }`}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {loading ? t("profile.adding") : t("profile.add")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
