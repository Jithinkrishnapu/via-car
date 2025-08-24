import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Href, router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import CopyRed from "../../../public/copy-red.svg";
import ReturnRed from "../../../public/return-red.svg";
import CancelRed from "../../../public/cancel-red.svg";
import { SvgProps } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

interface MenuItems {
  label: string;
  route: Href;
  sub?: string;
  icon?: React.FC<SvgProps>;
}

export default function YourPublicationScreen() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  if (!loaded) return null;

  const menuItems: MenuItems[] = [
    { label: t("yourPublication.itinerary"), route: "/(publish)/itinerary" },
    { label: t("yourPublication.route"), route: "/(publish)/route-edit" },
    {
      label: t("yourPublication.price"),
      sub: t("yourPublication.priceSub"),
      route: "/(publish)/show-pricing",
    },
    {
      label: t("yourPublication.seatOptions"),
      route: "/(publish)/passenger-options",
    },
  ];

  const bottomActions: MenuItems[] = [
    {
      label: t("yourPublication.duplicate"),
      icon: CopyRed,
      route: "/(publish)/your-publication",
    },
    {
      label: t("yourPublication.publishReturn"),
      icon: ReturnRed,
      route: "/(publish)/your-publication",
    },
    {
      label: t("yourPublication.cancel"),
      icon: CancelRed,
      route: "/(publish)/your-publication",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="max-w-[716px] w-full self-center px-6 pt-16 lg:pt-20 pb-24 flex-col gap-4">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.push("/(publish)/your-ride")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("yourPublication.title")}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="flex-col w-full divide-y divide-[#EBEBEB] divide-dashed">
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
              className="py-2 flex-row items-center"
            >
              <View className="flex-1">
                <Text
                  fontSize={16}
                  className="text-[16px] font-[Kanit-Regular]"
                >
                  {item.label}
                </Text>
                {item.sub && (
                  <Text fontSize={12} className="text-[12px] text-[#939393]">
                    {item.sub}
                  </Text>
                )}
              </View>
              <ChevronRight size={25} strokeWidth={1} color="#666666" />
            </TouchableOpacity>
          ))}

          {/* Bottom Actions */}
          <View className="flex-col items-start gap-4 py-4">
            {bottomActions.map((act, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(act.route)}
                activeOpacity={0.8}
                className="flex-row items-center gap-2"
              >
                {act.icon && <act.icon width={16} height={16} />}
                <Text
                  fontSize={16}
                  className="text-[16px] text-[#FF0000] font-[Kanit-Regular]"
                >
                  {act.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
