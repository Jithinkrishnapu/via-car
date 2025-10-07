import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { combineDateAndTimeToUTC } from "@/utils/convertdatetime";

export default function RideCommentScreen() {
  const loaded = useLoadFonts();
  const [comment, setComment] = useState("");
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const { setRideField, ride } = useCreateRideStore()

  const handlePublishRide = () => {
    const isoString = combineDateAndTimeToUTC(ride.date, ride.time)
    const request = {
      "pickup_lat": ride.pickup_lat,
      "pickup_lng": ride.pickup_lng,
      "pickup_address": ride.pickup_address,
      "destination_lat": ride.destination_lat,
      "destination_lng": ride.destination_lng,
      "destination_address": ride.destination_address,
      "departure_time": isoString,
      "available_seats": ride.available_seats,
      "price_per_seat": ride.price_per_seat,
      "notes": comment,
      "vehicle_id": 1,
      "stops": [
        {
          "lat": 24.7136,
          "lng": 46.6753,
          "address": "King Fahd Road, Riyadh",
          "order": 1,
          "time": "08:00"
        },
        {
          "lat": 24.8456,
          "lng": 46.7192,
          "address": "Al Olaya, Riyadh",
          "order": 2,
          "time": "08:45"
        },
        {
          "lat": 24.9576,
          "lng": 46.6988,
          "address": "King Khalid Airport, Riyadh",
          "order": 3,
          "time": "10:30"
        }
      ],
      "prices": [
        {
          "pickup_order": 1,
          "drop_order": 2,
          "amount": 15
        },
        {
          "pickup_order": 1,
          "drop_order": 3,
          "amount": 35
        },
        {
          "pickup_order": 2,
          "drop_order": 3,
          "amount": 20
        }
      ]
    }
    console.log(request, "publish request")
    // router.push("/(publish)/publish-ride")
  }


  if (!loaded) return null;

  return (
    <View className="max-w-[894px] w-full self-center px-6 pt-16 lg:pt-20 pb-12 lg:pb-24 flex flex-col gap-4 flex-1 bg-white">
      {/* Header */}
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
          className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
        >
          {t("publishComment.title")}
        </Text>
      </View>

      {/* Textarea */}
      <TextInput
        allowFontScaling={false}
        value={comment}
        onChangeText={setComment}
        placeholder={t("publishComment.placeholder")}
        placeholderTextColor="#999999"
        multiline
        className="flex-1 text-[14px] font-[Kanit-Light] bg-[#F5F5F5] rounded-2xl p-6 max-h-[200px]"
        style={{ textAlignVertical: "top", minHeight: 228, fontSize: 14 }}
      />

      {/* Publish Button */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={handlePublishRide}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full w-full h-[55px] items-center justify-center mt-6"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("publishComment.publish")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
