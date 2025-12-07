import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";
import People from "../../../public/people.svg";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { RideEditDetails } from "@/types/ride-types";
import { useEditRide } from "@/service/ride-booking";

export default function Page() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const {setRideField,ride} = useCreateRideStore()
  const { isRTL, swap } = useDirection();
  console.log("seatoptions=============",ride.available_seats)
  const [passengers, setPassengers] = useState(ride.available_seats);
  const [comfortMode, setComfortMode] = useState(ride?.max_2_in_back);


  const adjustPassengers = (delta: number) => {
    setPassengers((prev) => Math.max(1, Math.min(9, prev + delta)));
  };


  const handleEditPassenger =async(passenger:number)=>{
    const req ={passengers:passenger,max_2_in_back:comfortMode} as RideEditDetails
    const res = await useEditRide(req)
    if(res.ok){
      setRideField("available_seats",passenger)
      setRideField("max_2_in_back",comfortMode)
      router.replace("..")
    }
  }

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-lg w-full self-center pt-16 pb-12 px-6">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("passengerCount.title")}
          </Text>
        </View>

        {/* Passenger Adjuster */}
        <View className="flex-row items-center justify-center space-x-2 px-6 mb-4">
          <TouchableOpacity
            onPress={() => adjustPassengers(-1)}
            activeOpacity={0.8}
            disabled={passengers === 1}
            className="w-[32px] h-[32px] rounded-full items-center justify-center"
          >
            <MinusLarge width={32} height={32} />
          </TouchableOpacity>

          <View className="flex-1 items-center py-4">
            <Text
              fontSize={60}
              className="text-[60px] text-[#00665A] font-[Kanit-SemiBold]"
            >
              {passengers.toString().padStart(2, "0")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => adjustPassengers(1)}
            activeOpacity={0.8}
            disabled={passengers === 9}
            className="w-[32px] h-[32px] rounded-full items-center justify-center"
          >
            <PlusLarge width={32} height={32} />
          </TouchableOpacity>
        </View>

        {/* Comfort Mode Checkbox */}
        <Text
          fontSize={18}
          className="text-[18px] text-black font-[Kanit-Regular] mb-[15px]"
        >
          {t("passengerCount.options")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setComfortMode((prev) => !prev)}}
          activeOpacity={0.8}
          className="flex-row items-center gap-4 w-full border border-[#EBEBEB] rounded-2xl px-4 py-4 mb-8"
        >
          <People width={20} height={20} />
          <View className="flex-1">
            <Text
              fontSize={14}
              className="text-sm lg:text-base font-[Kanit-Regular]"
            >
              {t("passengerCount.maxTwoInBack")}
            </Text>
            <Text
              fontSize={12}
              className="text-xs lg:text-[0.938rem] text-[#666666] font-[Kanit-Light]"
            >
              {t("passengerCount.comfortHint")}
            </Text>
          </View>
          {comfortMode ? (
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

        {/* Continue */}
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => {
            handleEditPassenger(passengers)}}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
