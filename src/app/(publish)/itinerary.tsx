import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { ChevronLeft, ChevronRight, Map } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

// SVG Icons
import CarGreen from "../../../public/car-green.svg";
import LocationPinGreen from "../../../public/location-pin-green.svg";
import FlagRed from "../../../public/flag-red.svg";
import ToolRed from "../../../public/tool-red.svg";
import PathPattern from "../../../public/path.svg";
import { useRoute } from "@react-navigation/native";
import { useGetPublishedRideDetails } from "@/service/ride-booking";
import { useCreateRideStore } from "@/store/useRideStore";
import { format, parseISO } from "date-fns";

export default function ItineraryDetailsScreen() {
  /* ------------------------------------------------------------------ */
  /* 1. Hooks & routing                                                 */
  /* ------------------------------------------------------------------ */
  const loaded        = useLoadFonts();
  const { t }         = useTranslation("components");
  const { isRTL }     = useDirection();
  const route         = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  /* ------------------------------------------------------------------ */
  /* 2. Global store                                                    */
  /* ------------------------------------------------------------------ */
  const { ride, selectedPlaces,setRideId } = useCreateRideStore();

  /* ------------------------------------------------------------------ */
  /* 3. Local state                                                     */
  /* ------------------------------------------------------------------ */
  const [rideDetail, setRideDetail] = useState<any>(null);
  const [ready, setReady]           = useState(false);

  /* ------------------------------------------------------------------ */
  /* 4. Data fetching                                                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const resp = await useGetPublishedRideDetails({ ride_id: route.params?.ride_id });
        setRideId(Number(route.params?.ride_id))
        if (resp?.data) setRideDetail(resp.data);
      } finally {
        setReady(true);          // <- always mark as finished
      }
    })();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 5. Guard: fonts or data not ready                                  */
  /* ------------------------------------------------------------------ */
  if (!loaded || !ready || !ride || !rideDetail) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* 6. Render real UI – every field is now safe to access              */
  /* ------------------------------------------------------------------ */
  return (
    <ScrollView className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-[1388px] w-full self-center px-6 pt-16 pb-6 flex flex-col gap-7">
        {/* ---------------- Header ---------------- */}
        <View className="flex-row items-center gap-4 w-full mb-4">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text fontSize={25} className="text-[25px] font-[Kanit-Medium] text-black">
            {t("itinerary.title")}
          </Text>
        </View>

        {/* ---------------- Timeline ---------------- */}
        <View className="bg-white border border-[#EBEBEB] rounded-2xl p-4 overflow-hidden">
          {/* vertical line */}
          <View className="absolute top-6 bottom-6 left-[24px] w-[3px] z-0 overflow-hidden">
            {Array.from({ length: selectedPlaces.length + 3 }, (_, i) => (
              <PathPattern key={i} />
            ))}
          </View>

          {/* start */}
          <View className="flex-row items-center gap-4 mb-6 z-10">
            <CarGreen />
            <Text fontSize={16} className="text-[14px] text-[#3F3C3C] font-[Kanit-Light]">
              {ride.pickup_address}
            </Text>
          </View>

          {/* stops */}
          {selectedPlaces.map(({ address }, idx) => (
            <View key={idx} className="flex-row items-center mb-6 z-10">
              <LocationPinGreen />
              <Text fontSize={15} className="text-[14px] font-[Kanit-Regular] ml-4">
                {address}
              </Text>
            </View>
          ))}

          {/* destination */}
          <View className="flex-row items-center gap-4 z-10">
            <FlagRed />
            <Text fontSize={16} className="text-[16px] text-[#3F3C3C] font-[Kanit-Light]">
              {ride.destination_address}
            </Text>
          </View>
        </View>

        {/* ---------------- Details Panel ---------------- */}
        <View className="flex-col divide-y divide-[#EBEBEB] divide-dashed">
          {/* Date */}
          <TouchableOpacity
            onPress={() => router.push("/(publish)/date-edit")}
            className="py-4 flex-row items-center"
          >
            <View className="flex-1">
              <Text fontSize={14}>{t("itinerary.date")}</Text>
              <Text fontSize={14} className="text-[#939393]">
                {ride?.date
  ? format(new Date(ride.date), 'MMM dd yyyy')
  : ''}
              </Text>
            </View>
            <ChevronRight size={20} strokeWidth={1} />
          </TouchableOpacity>

          {/* Time */}
          <TouchableOpacity
            onPress={() => router.push("/(publish)/time-edit")}
            className="py-4 flex-row items-center"
          >
            <View className="flex-1">
              <Text fontSize={14}>{t("itinerary.time")}</Text>
              <Text fontSize={14} className="text-[#939393]">
              {ride.time}
              </Text>
            </View>
            <ChevronRight size={20} strokeWidth={1} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------- Manage Stopovers ---------------- */}
      <View className="px-6 border-t-[7px] border-[#F7F7F7]">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/stopovers-edit")}
          className="py-4 flex-row items-center"
        >
          <ToolRed width={14} height={14} />
          <Text fontSize={14} className="text-[#FF0000] font-[Kanit-Regular] ml-2">
            {t("itinerary.manageStopovers")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- Map Modal (unchanged) ---------------- */}
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