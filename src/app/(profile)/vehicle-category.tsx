import React, { useState } from "react";
import { ScrollView, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useStore } from "@/store/useStore";

const routesData = [
  { id: "1", title: "Sedan", img: require("../../../public/sedan.png") },
  { id: "2", title: "Luxury", img: require("../../../public/luxury.png") },
  { id: "3", title: "SUV", img: require("../../../public/suv-category.png") },
];

export default function SelectCategoryPage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const [selected, setSelected] = useState("1");
  const {setVehicle,vehicle} = useStore()

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

      <View className="flex-wrap justify-between px-6 mt-6">
        {routesData.map(({ id, title, img }) => {
          const isSelected = selected === id;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.8}
              onPress={() => {
                setVehicle(vehicle.brand_id,id)
                setSelected(id)}}
              className={`border ${
                isSelected ? "border-green-400 bg-green-50" : "border-gray-200"
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
                source={img}
                className="h-24 w-full object-contain"
                resizeMode="contain"
              />
              <View className="flex-row items-center justify-between w-full">
                <Text fontSize={18} className="text-lg font-[Kanit-Medium]">
                  {t(`profile.${title.toLowerCase()}`)}
                </Text>
                <View
                  className={`w-8 h-8 rounded-full border ${
                    isSelected ? "border-transparent" : "border-gray-300"
                  } items-center justify-center`}
                >
                  {isSelected && <CheckGreen width={24} height={24} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

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
