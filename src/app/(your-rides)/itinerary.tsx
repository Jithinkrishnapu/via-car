import React, { useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { ChevronLeft, ChevronRight, Map } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

// SVG Icons (via transformer)
import CarGreen from "../../../public/car-green.svg";
import LocationPinGreen from "../../../public/location-pin-green.svg";
import FlagRed from "../../../public/flag-red.svg";
import ToolRed from "../../../public/tool-red.svg";
import PathPattern from "../../../public/path.svg";

const stops = [
  { title: "Heritage Village", desc: "Corniche Rd, Dammam, Saudi Arabia" },
];

export default function ItineraryDetailsScreen() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [modalVisible, setModalVisible] = useState(false);

  if (!loaded) return null;

  // Use translation for stops
  const stops = [
    {
      title: t("itinerary.stopTitle"),
      desc: t("itinerary.stopDesc"),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-[1388px] w-full self-center px-6 pt-16 pb-6 flex flex-col gap-7">
        {/* Header */}
        <View className="flex-row items-center gap-4 w-full mb-4">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] text-black"
          >
            {t("itinerary.title")}
          </Text>
        </View>

        {/* Content Grid (stacked in native) */}
        <View className="flex-col gap-6">
          {/* Timeline Panel */}
          <View className="bg-white border border-[#EBEBEB] rounded-2xl p-4 overflow-hidden">
            {/* vertical line */}
            <View className="absolute top-6 bottom-6 left-[24px] w-[3px] z-0 overflow-hidden">
              <PathPattern />
              <PathPattern />
              <PathPattern />
            </View>

            {/* Start point */}
            <View className="flex-row items-center gap-4 mb-6 z-10">
              <CarGreen />
              <Text
                fontSize={14}
                className="text-[14px] text-[#3F3C3C] font-[Kanit-Light] flex-1"
              >
                {t("itinerary.start")}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
                className="rounded-full size-[46px] items-center justify-center"
              >
                <Map
                  width={20}
                  height={20}
                  color="#666666"
                  className="-scale-[1]"
                />
              </TouchableOpacity>
            </View>

            {/* Stops */}
            {stops.map(({ title, desc }, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between mb-6 z-10"
              >
                <LocationPinGreen />
                <View className="flex-1 flex-row items-center justify-between ml-4">
                  <View>
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Regular]"
                    >
                      {title}
                    </Text>
                    <Text
                      fontSize={10}
                      className="text-[10px] text-[#666666] font-[Kanit-Light]"
                    >
                      {desc}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                    className="rounded-full size-[46px] items-center justify-center"
                  >
                    <Map
                      width={20}
                      height={20}
                      color="#666666"
                      className="-scale-[1]"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* End point */}
            <View className="flex-row items-center gap-4 z-10">
              <FlagRed />
              <Text
                fontSize={14}
                className="text-[14px] text-[#3F3C3C] font-[Kanit-Light] flex-1"
              >
                {t("itinerary.end")}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
                className="rounded-full size-[46px] items-center justify-center"
              >
                <Map
                  width={20}
                  height={20}
                  color="#666666"
                  className="-scale-[1]"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Details Panel */}
          <View className="flex-col divide-y divide-[#EBEBEB] divide-dashed">
            {/* Date */}
            <TouchableOpacity
              onPress={() => router.push("/(your-rides)/date-edit")}
              activeOpacity={0.8}
              className="py-4 flex-row items-center"
            >
              <View className="flex-1">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular]"
                >
                  {t("itinerary.date")}
                </Text>
                <Text fontSize={10} className="text-[10px] text-[#939393]">
                  {t("itinerary.dateValue")}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color="#000"
                className="ml-auto"
                strokeWidth={1}
              />
            </TouchableOpacity>

            {/* Time */}
            <TouchableOpacity
              onPress={() => router.push("/(your-rides)/time-edit")}
              activeOpacity={0.8}
              className="py-4 flex-row items-center"
            >
              <View className="flex-1">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular]"
                >
                  {t("itinerary.time")}
                </Text>
                <Text fontSize={10} className="text-[10px] text-[#939393]">
                  {t("itinerary.timeValue")}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color="#000"
                className="ml-auto"
                strokeWidth={1}
              />
            </TouchableOpacity>

            {/* Manage Stopovers */}
          </View>
        </View>
      </View>
      <View className="px-6 border-t-[7px] border-[#F7F7F7]">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/stopovers-edit")}
          activeOpacity={0.8}
          className="py-4 flex-row items-center"
        >
          <ToolRed width={14} height={14} />
          <Text
            fontSize={14}
            className="text-[14px] text-[#FF0000] font-[Kanit-Regular] ml-2"
          >
            {t("itinerary.manageStopovers")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-3/4 rounded-t-3xl overflow-hidden">
            <Image
              source={require("../../../public/map-drawer.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
