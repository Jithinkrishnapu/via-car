import { useState } from "react";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Route() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [selectedRoute, setSelectedRoute] = useState("1");
  if (!loaded) return null;

  // Use translation for routes
  const routesData = [
    {
      id: "1",
      title: t("route.option1.title"),
      description: t("route.option1.description"),
    },
    {
      id: "2",
      title: t("route.option2.title"),
      description: t("route.option2.description"),
    },
    {
      id: "3",
      title: t("route.option3.title"),
      description: t("route.option3.description"),
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 relative">
        <TouchableOpacity
          className={swap(
            "absolute top-12 left-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center",
            "absolute top-12 right-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          )}
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
        </TouchableOpacity>
        <Image
          source={require("../../../public/map-select.png")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="bg-white rounded-t-3xl px-[28px] pt-[43px] -mt-8 z-10">
        <Text fontSize={23} className="text-[23px] font-[Kanit-Medium] mb-6">
          {t("route.title")}
        </Text>

        {routesData.map(({ id, title, description }) => {
          const isSelected = selectedRoute === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedRoute(id)}
              activeOpacity={0.8}
              className={`border px-[20px] py-[18px] rounded-2xl mb-4 flex-row justify-between items-center ${
                isSelected
                  ? "border-[#69D2A5] bg-[#F1FFF9]"
                  : "border-[#EBEBEB] bg-white"
              }`}
            >
              <View className="flex-1">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular]"
                >
                  {title}
                </Text>
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Regular] text-[#999999]"
                >
                  {description}
                </Text>
              </View>
              {isSelected ? (
                <CheckGreen width={25} height={25} />
              ) : (
                <Circle
                  color="#BBBBBB"
                  width={25}
                  height={25}
                  strokeWidth={1}
                  className="size-[25px]"
                />
              )}
            </TouchableOpacity>
          );
        })}

        <View className="py-5">
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full h-[55px] flex-row items-center justify-center"
            onPress={() => router.push("/(publish)/your-publication")}
            activeOpacity={0.8}
          >
            <Text
              fontSize={20}
              className="text-xl text-white font-[Kanit-Regular]"
            >
              {t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Route;
