import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import RideStatusItem from "@/components/common/ride-status-item";
import Text from "@/components/common/text";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const tabs = ["Pending", "Cancelled", "Completed"] as const;
type Tab = (typeof tabs)[number];

export default function RidesTabsScreen() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<Tab>("Completed");
  const indicatorX = useSharedValue(0);
  const tabWidth = (width - 48 + 6) / tabs.length;

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    indicatorX.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 90,
    });
  }, [activeTab, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  const renderContent = () => (
    <View className="flex-row flex-wrap justify-between gap-[20px] py-[20px]">
      {Array.from({ length: 3 }).map((_, idx) => (
        <RideStatusItem status={activeTab} key={`${activeTab}-${idx}`} />
      ))}
    </View>
  );

  if (!loaded) return null;
  return (
    <ScrollView className="flex-1 bg-[#F5F5F5]">
      <View className="px-6 pt-16 mb-[25px]">
        <Text
          fontSize={22}
          className="text-[22px] text-black font-[Kanit-Medium]"
        >
          {t("yourRides.title")}
        </Text>
      </View>
      <View className="px-6">
        <View className="flex-row h-[40px] bg-white border border-[#EBEBEB] rounded-full overflow-hidden">
          <Animated.View
            style={animatedIndicatorStyle}
            className="rounded-full bg-[#FF4848] h-[38px] absolute z-0"
          />
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 items-center justify-center rounded-full",
                  !isActive && "z-10",
                  activeTab === "Pending" &&
                    tab === "Cancelled" &&
                    "border-r border-[#EBEBEB]",
                  activeTab === "Completed" &&
                    tab === "Cancelled" &&
                    "border-l border-[#EBEBEB]"
                )}
              >
                <Text
                  fontSize={15}
                  className={cn(
                    "text-[15px] font-[Kanit-Regular] z-10 transition-all duration-700",
                    isActive ? "text-white" : "text-[#666666]"
                  )}
                >
                  {t(`yourRides.tabs.${tab}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <ScrollView className="flex-1">{renderContent()}</ScrollView>
      </View>
    </ScrollView>
  );
}
