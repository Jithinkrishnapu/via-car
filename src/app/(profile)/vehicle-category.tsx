import React, { useState, useEffect } from "react";
import { ScrollView, View, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useStore } from "@/store/useStore";
import { getVehicleCategoryList } from "@/service/vehicle";

// Fallback images for categories
const categoryImages: Record<string, any> = {
  sedan: require("../../../public/sedan.png"),
  luxury: require("../../../public/luxury.png"),
  suv: require("../../../public/suv-category.png"),
};

export default function SelectCategoryPage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const [selected, setSelected] = useState("");
  const { setVehicle, vehicle } = useStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getVehicleCategoryList();
      if (response?.data) {
        setCategories(response.data);
        // Set first category as default if none selected
        if (response.data.length > 0 && !selected) {
          setSelected(response.data[0].id.toString());
          setVehicle(vehicle.brand_id, response.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return null;

  return (
    <ScrollView className="font-[Kanit-Regular] flex-1 bg-white">
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
          {t("profile.selectCategory")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#FF4848" />
          <Text className="mt-4 text-gray-600 font-[Kanit-Light]">
            {t("Loading categories...")}
          </Text>
        </View>
      ) : (
        <View className="flex-wrap justify-between px-6 mt-6">
          {categories.map((category) => {
            const isSelected = selected === category.id.toString();
            const categorySlug = category.slug?.toLowerCase() || "";

            // Use API image if available, otherwise fallback to local
            const imageSource = category.image
              ? { uri: category.image }
              : categoryImages[categorySlug] || categoryImages.sedan;

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.8}
                onPress={() => {
                  setVehicle(vehicle.brand_id, category.id.toString());
                  setSelected(category.id.toString());
                }}
                className={`border ${isSelected ? "border-green-400 bg-green-50" : "border-gray-200"
                  } rounded-2xl mb-4`}
                style={{
                  width: "100%",
                  height: 217,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Image
                  source={imageSource}
                  className="h-24 w-full object-contain"
                  resizeMode="contain"
                />
                <View className="flex-row items-center justify-between w-full">
                  <Text fontSize={18} className="text-lg font-[Kanit-Medium]">
                    {category.name}
                  </Text>
                  <View
                    className={`w-8 h-8 rounded-full border ${isSelected ? "border-transparent" : "border-gray-300"
                      } items-center justify-center`}
                  >
                    {isSelected && <CheckGreen width={24} height={24} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View className="px-6 mt-8 mb-12">
        <TouchableOpacity
          onPress={() => router.push("/(profile)/vehicle-model")}
          activeOpacity={0.8}
          className="bg-red-500 h-14 rounded-full flex-row items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("profile.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
