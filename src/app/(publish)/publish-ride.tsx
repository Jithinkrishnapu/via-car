import React, { useState } from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ApprovedAnimation from "@/components/animated/approved-animation";
import CheckGreen from "../../../public/check-green.svg";
import MailAnimation from "@/components/animated/mail-animation";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useRoute } from "@react-navigation/native";
import { useCreateRideStore } from "@/store/useRideStore";

export default function RideConfirmationScreen() {
  const loaded = useLoadFonts();
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();

  const { ride, setSelectedPlaces, selectedPlaces, setRideId } = useCreateRideStore();
  if (!loaded) return null;

  const route = useRoute()

  console.log("publishride----------------",route)

  return (
    <View className="flex-1 bg-white relative">
      {/* Success Banner */}
      <View className="bg-[#EEFFFD] p-8 pt-12 pb-10 items-center">
        <ApprovedAnimation />
        <Text
          fontSize={22}
          className="text-[22px] font-[Kanit-Medium] text-center max-w-[530px] leading-tight mt-6"
        >
          {t("publishRide.success")}
        </Text>
      </View>

      {/* Verification Steps */}
      <View className="max-w-[716px] w-full self-center px-6 pt-6 pb-24 flex-col gap-4">
        {/* <Text
          fontSize={20}
          className="text-[20px] leading-tight font-[Kanit-Regular]"
        >
          {t("publishRide.verifyProfile")}
        </Text> */}

        {/* Options */}
        {/* <View className="flex-col">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
            className="py-4 flex-row items-center border-b border-[#EBEBEB] border-dashed"
          >
            <View className="flex-row items-center gap-4 flex-1">
              <CheckGreen width={18} height={18} />
              <Text fontSize={16} className="text-[16px] font-[Kanit-Light]">
                {t("publishRide.verifyId")}
              </Text>
            </View>
            <ChevronRight size={20} strokeWidth={1} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="py-4 flex-row items-center"
          >
            <View className="flex-row items-center gap-4">
              <CheckGreen width={18} height={18} />
              <Text fontSize={16} className="text-[16px] font-[Kanit-Light]">
                {t("publishRide.confirmedPhone")}
              </Text>
            </View>
          </TouchableOpacity>
        </View> */}

        {/* See My Ride */}
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => {
            setSelectedPlaces([])
            router.replace("/(tabs)/book")}}
          activeOpacity={0.8}
          className="border-[#FF4848] border rounded-full w-full h-[55px] items-center justify-center mt-6"
        >
          <Text
            fontSize={20}
            className="text-xl text-[#FF4848] font-[Kanit-Regular]"
          >
            {"Back to Home"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setRideId(route?.params?.ride_id)
            router.push({pathname:"/(publish)/your-ride",params:{ride_id:route?.params?.ride_id,ride_amount_id:route?.params?.ride_amount_id}})}}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full w-full h-[55px] items-center justify-center mt-6"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("publishRide.seeMyRide")}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
            <MailAnimation />
            <Text
              fontSize={23}
              className="text-[23px] font-[Kanit-Regular] text-black leading-tight text-center mt-4"
            >
              {t("publishRide.emailSent")}
            </Text>
            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                className="bg-[#FF4848] rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text
                  fontSize={18}
                  className="text-[18px] text-white text-center font-[Kanit-Medium]"
                >
                  {t("publishRide.ok")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
