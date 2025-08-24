import { useState } from "react";
import { Modal, Image, TouchableOpacity, View } from "react-native";
import { ChevronLeft, Map } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import CarGreen from "../../../public/car-green.svg";
import LocationPin from "../../../public/location-pin-green.svg";
import FlagRed from "../../../public/flag-red.svg";
import Path from "../../../public/path.svg";
import { useTranslation } from "react-i18next";

function StopoversPreview() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const [modalVisible, setModalVisible] = useState(false);

  if (!loaded) return null;

  // Use translation for stops
  const stops = [
    {
      title: t("stopoversPreview.stop1.title"),
      desc: t("stopoversPreview.stop1.desc"),
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="w-full px-6 pt-16 pb-6 flex-1">
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("stopoversPreview.title")}
          </Text>
        </View>

        {/* Timeline Container */}
        <View className="bg-white border border-[#EBEBEB] rounded-2xl p-4 overflow-hidden">
          {/* vertical line */}
          <View className="absolute top-6 bottom-6 left-[24px] w-[3px] z-0 overflow-hidden">
            <Path />
            <Path />
            <Path />
          </View>

          {/* Start point */}
          <View className="flex-row items-center gap-4 mb-6 z-10">
            <CarGreen />
            <Text
              fontSize={16}
              className="text-[14px] text-[#3F3C3C] font-[Kanit-Light]"
            >
              {t("stopoversPreview.start")}
            </Text>
          </View>

          {/* Stops */}
          {stops.map(({ title, desc }, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between mb-6 z-10"
            >
              <LocationPin />
              <View className="flex-1 flex-row items-center justify-between ml-4">
                <View>
                  <Text
                    fontSize={15}
                    className="text-[14px] font-[Kanit-Regular]"
                  >
                    {title}
                  </Text>
                  <Text
                    fontSize={13}
                    className="text-[12px] text-[#666666] font-[Kanit-Light]"
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
              fontSize={16}
              className="text-[16px] text-[#3F3C3C] font-[Kanit-Light]"
            >
              {t("stopoversPreview.end")}
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/your-publication")}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text
            fontSize={19}
            className="text-[19px] text-white font-[Kanit-Light]"
          >
            {t("common.save")}
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
    </View>
  );
}

export default StopoversPreview;
