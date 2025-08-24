import React, { useState } from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import Direction4 from "../../../public/direction4.svg";
import MinusRed from "../../../public/minus-red.svg";
import PlusRed from "../../../public/plus-red.svg";
import Direction5 from "../../../public/direction5.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function ShowPricing() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [amountOne, setAmountOne] = useState(640.0);
  const [amountTwo, setAmountTwo] = useState(120.0);
  const [amountThree, setAmountThree] = useState(420.0);

  const clamp = (value: number) => Math.max(1000, Math.min(4000, value));

  const adjustAmountOne = (delta: number) =>
    setAmountOne(clamp(amountOne + delta));
  const adjustAmountTwo = (delta: number) =>
    setAmountTwo(clamp(amountTwo + delta));
  const adjustAmountThree = (delta: number) =>
    setAmountThree(clamp(amountThree + delta));

  if (!loaded) return null;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="h-[260px]">
        <ImageBackground
          source={require("../../../public/hero.png")}
          className="flex-1 w-full h-full"
          resizeMode="cover"
        >
          <View className="absolute inset-0 max-w-[1410px] w-full mx-auto px-6 pt-[60px]">
            <View className="flex-row items-center gap-6 mb-8">
              <TouchableOpacity
                onPress={() => router.replace("..")}
                activeOpacity={0.8}
                className="rounded-full size-[45px] bg-white/20 items-center justify-center"
              >
                {swap(
                  <ChevronLeft color="#ffffff" size={24} />,
                  <ChevronRight color="#ffffff" size={24} />
                )}
              </TouchableOpacity>
              <Text
                fontSize={22}
                className="text-[22px] text-white font-[Kanit-Medium]"
              >
                {t("showPricing.rideDetails")}
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <Direction4 width={24} />
              <View className="flex flex-col flex-1">
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("showPricing.pickup")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white mb-4"
                >
                  {t("showPricing.alKhobar")}
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("showPricing.drop")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white"
                >
                  {t("showPricing.riyadh")}
                </Text>
              </View>
              <View className="flex-row items-center justify-center gap-4 ml-auto">
                <TouchableOpacity
                  onPress={() => adjustAmountOne(-500)}
                  activeOpacity={0.8}
                  disabled={amountOne === 500}
                  className="size-[18px] rounded-full items-center justify-center"
                >
                  <MinusRed width={18} height={18} />
                </TouchableOpacity>
                <View className="items-center">
                  <Text
                    fontSize={14}
                    className="text-[14px] text-white font-[Inter] font-semibold"
                  >
                    SR{" "}
                    {amountOne.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => adjustAmountOne(500)}
                  activeOpacity={0.8}
                  disabled={amountOne >= 4000}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <PlusRed width={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Details Sections */}
      <View className="flex-1">
        {/* Section Two */}
        <View className="flex-row items-center gap-4 px-6 pt-6">
          <Direction5 width={24} className="mt-[4px]" />
          <View className="flex flex-col flex-1">
            <Text
              fontSize={10}
              className="text-[10px] text-[#939393] font-[Kanit-Light]"
            >
              {t("showPricing.pickup")}
            </Text>
            <Text
              fontSize={12}
              className="text-[12px] text-black font-[Kanit-Light] mb-4"
            >
              {t("showPricing.alKhobar")}
            </Text>
            <Text
              fontSize={10}
              className="text-[10px] text-[#939393] font-[Kanit-Light]"
            >
              {t("showPricing.stopover")}
            </Text>
            <Text
              fontSize={12}
              className="text-[12px] text-black font-[Kanit-Light]"
            >
              {t("showPricing.heritageVillage")}
            </Text>
          </View>
          <View className="flex-row items-center justify-center ml-auto w-max">
            <TouchableOpacity
              onPress={() => adjustAmountTwo(-500)}
              activeOpacity={0.8}
              disabled={amountTwo === 500}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <MinusRed width={18} />
            </TouchableOpacity>
            <View className="items-center">
              <Text
                fontSize={12}
                className="text-[12px] text-black font-[Inter]"
              >
                SR{" "}
                {amountTwo.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => adjustAmountTwo(500)}
              activeOpacity={0.8}
              disabled={amountTwo >= 4000}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <PlusRed width={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Three */}
        <View className="flex-row items-center gap-4 px-6 pt-6">
          <Direction5 width={24} className="mt-[4px]" />
          <View className="flex flex-col flex-1">
            <Text
              fontSize={10}
              className="text-[10px] text-[#939393] font-[Kanit-Light]"
            >
              {t("showPricing.pickup")}
            </Text>
            <Text
              fontSize={12}
              className="text-[12px] text-black font-[Kanit-Light] mb-4"
            >
              {t("showPricing.heritageVillage")}
            </Text>
            <Text
              fontSize={10}
              className="text-[10px] text-[#939393] font-[Kanit-Light]"
            >
              {t("showPricing.stopover")}
            </Text>
            <Text
              fontSize={12}
              className="text-[12px] text-black font-[Kanit-Light]"
            >
              {t("showPricing.riyadh")}
            </Text>
          </View>
          <View className="flex-row items-center justify-center ml-auto w-max">
            <TouchableOpacity
              onPress={() => adjustAmountThree(-500)}
              activeOpacity={0.8}
              disabled={amountThree === 500}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <MinusRed width={18} />
            </TouchableOpacity>
            <View className="items-center">
              <Text
                fontSize={12}
                className="text-[12px] text-black font-[Inter]"
              >
                SR{" "}
                {amountThree.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => adjustAmountThree(500)}
              activeOpacity={0.8}
              disabled={amountThree >= 4000}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <PlusRed width={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default ShowPricing;
