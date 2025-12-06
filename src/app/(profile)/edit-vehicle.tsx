import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import Text from "@/components/common/text";
import { InputComponent } from "@/components/inputs/common-input";
import ColorSearch from "@/components/common/color-search";
import VehicleSearch from "@/components/common/vehicle-search";
import ModelSearch from "@/components/common/model-search";
import { updateVehicle } from "@/service/vehicle";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import CheckGreen from "../../../public/check-green.svg";

export default function EditVehicle() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  const vehicleData = params.vehicleData 
    ? JSON.parse(params.vehicleData as string) 
    : null;

  const [color, setColor] = useState(vehicleData?.color || "");
  const [year, setYear] = useState(vehicleData?.year?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(vehicleData?.model?.category_id?.toString() || "");
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [showBrandSelection, setShowBrandSelection] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const { vehicle, setVehicle, vehicle_model_id, setVehicleModelId } = useStore();

  const [errors, setErrors] = useState<{
    color?: string;
    year?: string;
  }>({});

  const categoryImages: Record<string, any> = {
    sedan: require("../../../public/sedan.png"),
    luxury: require("../../../public/luxury.png"),
    suv: require("../../../public/suv-category.png"),
  };

  useEffect(() => {
    if (showCategorySelection && categories.length === 0) {
      fetchCategories();
    }
  }, [showCategorySelection]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { getVehicleCategoryList } = await import("@/service/vehicle");
      const response = await getVehicleCategoryList();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!color.trim()) {
      newErrors.color = t("Color is required");
    }

    if (!year.trim()) {
      newErrors.year = t("Year is required");
    } else if (!/^\d{4}$/.test(year)) {
      newErrors.year = t("Year must be 4 digits");
    } else {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = t(`Year must be between 1900 and ${currentYear + 1}`);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setIsLoading(true);
    
    // Use updated model_id if changed, otherwise use original
    const modelId = vehicle_model_id || vehicleData?.model?.id;
    
    // API expects JSON body with vehicle_id, model_id, year, color
    const payload = {
      vehicle_id: vehicleData?.id,
      model_id: parseInt(modelId),
      year: parseInt(year.trim()),
      color: color.trim(),
    };
    console.log("update---payload----",payload)
    try {
      const { body } = await updateVehicle(payload);
      
      if (body?.message) {
        Alert.alert(t("Success"), body.message);
      }
      
      // Clear store
      setVehicleModelId("");
      setVehicle("", "");
      
      router.back();
    } catch (error: any) {
      const errorMessage = error?.body?.message || error.message || t("Failed to update vehicle");
      Alert.alert(t("Error"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pb-4 pt-16 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="p-2 -ml-2"
        >
          <ArrowLeft size={24} color="#0A2033" />
        </TouchableOpacity>
        <Text fontSize={24} className="text-2xl text-black font-[Kanit-Medium]">
          {t("Edit Vehicle")}
        </Text>
      </View>

      <View className="px-6 mt-6">
        {/* Brand Selection */}
        <View className="mb-4">
          <Text fontSize={14} className="text-sm font-[Kanit-Medium] mb-2">
            {t("Brand & Model")}
          </Text>
          {!showBrandSelection ? (
            <TouchableOpacity
              onPress={() => setShowBrandSelection(true)}
              className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg"
              activeOpacity={0.7}
            >
              <View>
                <Text fontSize={16} className="font-[Kanit-Medium]">
                  {vehicleData?.brand?.name} {vehicleData?.model?.name}
                </Text>
                <Text fontSize={12} className="text-gray-600 font-[Kanit-Light]">
                  {t("Tap to change")}
                </Text>
              </View>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <VehicleSearch
              name="brand"
              placeholder={t("Search brand")}
              onSelect={() => setShowCategorySelection(true)}
            />
          )}
        </View>

        {/* Category Selection */}
        {showCategorySelection && (
          <View className="mb-4">
            <Text fontSize={14} className="text-sm font-[Kanit-Medium] mb-2">
              {t("Category")}
            </Text>
            {loadingCategories ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#FF4848" />
              </View>
            ) : (
              <View className="flex-wrap flex-row gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id.toString();
                  const categorySlug = category.slug?.toLowerCase() || "";
                  const imageSource = category.image
                    ? { uri: category.image }
                    : categoryImages[categorySlug] || categoryImages.sedan;

                  return (
                    <TouchableOpacity
                      key={category.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setVehicle(vehicle.brand_id, category.id.toString());
                        setSelectedCategory(category.id.toString());
                        setShowModelSelection(true);
                      }}
                      className={`border ${
                        isSelected ? "border-green-400 bg-green-50" : "border-gray-200"
                      } rounded-2xl p-3 flex-1 min-w-[100px]`}
                    >
                      <Image
                        source={imageSource}
                        className="h-16 w-full object-contain mb-2"
                        resizeMode="contain"
                      />
                      <View className="flex-row items-center justify-between">
                        <Text fontSize={14} className="text-sm font-[Kanit-Medium]">
                          {category.name}
                        </Text>
                        {isSelected && <CheckGreen width={20} height={20} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Model Selection */}
        {showModelSelection && (
          <View className="mb-4">
            <Text fontSize={14} className="text-sm font-[Kanit-Medium] mb-2">
              {t("Model")}
            </Text>
            <ModelSearch
              name="model"
              placeholder={t("Search model")}
              onSelect={() => {
                setShowBrandSelection(false);
                setShowCategorySelection(false);
                setShowModelSelection(false);
              }}
            />
          </View>
        )}

        {/* Color */}
        <View className="mb-4">
          <Text fontSize={14} className="text-sm font-[Kanit-Medium] mb-2">
            {t("Color")}
          </Text>
          <ColorSearch
            name="color"
            placeholder={t("Select vehicle color")}
            onSelect={(selectedColor) => {
              setColor(selectedColor);
              setErrors((prev) => ({ ...prev, color: undefined }));
            }}
          />
          {errors.color && (
            <Text className="text-red-500 text-xs mt-1">{errors.color}</Text>
          )}
        </View>

        <InputComponent
          label={t("Year")}
          placeHolder={t("Enter year (e.g., 2024)")}
          value={year}
          onChangeText={(text) => {
            setYear(text);
            setErrors((prev) => ({ ...prev, year: undefined }));
          }}
          keyboardType="number-pad"
          error={errors.year}
        />

        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={isLoading}
          className={`${
            isLoading ? "bg-red-300" : "bg-[#FF4848]"
          } rounded-full w-full h-[54px] items-center justify-center mt-6`}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text fontSize={20} className="text-white font-[Kanit-Regular]">
              {t("Update Vehicle")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
