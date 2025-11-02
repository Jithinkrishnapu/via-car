import React, { useEffect, useState } from "react";
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
import DirectionIcon from "../../../public/direction4.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useRoute } from "@react-navigation/native";
import { useGetPublishedRideDetails, useGetRideDetails } from "@/service/ride-booking";
import { RideDetail } from "@/types/ride-types";

export default function RidePlanScreen() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [rideDetail, setRideDetail] = useState<RideDetail>()

  if (!loaded) return null;


  const route = useRoute()

  console.log("ride---------------",route)

  const handleGetRideDetails = async () => {
    const postData = {
      ride_id: route?.params?.ride_id
    }
    console.log("postData========", postData)
    const response = await useGetPublishedRideDetails(postData)
    if (response?.data) {
      // handleRoutes(response?.data)
      setRideDetail(response.data)
      // setPolyline(response?.data?.rideId?.ride_route)
    }
    console.log("responde===========", JSON.stringify(response))
  }

  useEffect(()=>{
    handleGetRideDetails()
  },[])

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="h-[275px]">
        <ImageBackground
          source={require("../../../public/hero.png")}
          className="flex-1 w-full h-full"
          resizeMode="cover"
        >
          <View className="absolute inset-0 max-w-[1410px] w-full self-center px-6 pt-[60px] flex flex-col">
            <View className="flex-row items-center gap-4 mb-6">
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
                {t("yourRide.title")}
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <DirectionIcon width={24} />
              <View className="flex flex-col">
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("yourRide.pickup")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white mb-2"
                >
                  {rideDetail?.pickUpStop?.address}
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("yourRide.drop")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white"
                >
                  {rideDetail?.dropOffStop?.address}
                </Text>
              </View>
              {/* <View className="flex flex-col items-end ml-auto">
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("yourRide.pickupTime")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white mb-2"
                >
                  13:00
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("yourRide.dropTime")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base font-[Kanit-Regular] text-white"
                >
                  17:40
                </Text>
              </View> */}
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Options Section */}
      <View className="max-w-[1388px] w-full self-center px-6 pt-4 lg:pt-[80px] pb-12 lg:pb-[100px]">
        <View className="flex-col max-w-[716px] w-full self-center divide-y divide-[#EBEBEB] divide-dashed">
          {/* View Publication */}
          <TouchableOpacity
            onPress={() => {
              console.log("value==============",rideDetail)
              router.push({pathname:"/(publish)/ride-details",params:{ride_id:rideDetail?.rideId?.id,
              ride_amount_id: rideDetail?.rideAmount?.id
            }})}}
            activeOpacity={0.8}
            className="py-4 flex-row items-center"
          >
            <View className="flex flex-col flex-1">
              <Text fontSize={16} className="text-[16px] font-[Kanit-Regular]">
                {t("yourRide.seePublication")}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] text-[#939393] font-[Kanit-Regular]"
              >
                {t("yourRide.views")}
              </Text>
            </View>
            <ChevronRight
              size={25}
              strokeWidth={1}
              color="#666666"
              className="ml-auto"
            />
          </TouchableOpacity>

          {/* Edit Publication */}
          <TouchableOpacity
            onPress={() => router.push({pathname:"/(publish)/your-publication",params:{ride_id:rideDetail?.rideId?.id,
              ride_amount_id: rideDetail?.rideAmount?.id
            }})}
            activeOpacity={0.8}
            className="py-4 flex-row items-center"
          >
            <Text
              fontSize={16}
              className="text-[16px] font-[Kanit-Regular] flex-1"
            >
              {t("yourRide.editPublication")}
            </Text>
            <ChevronRight
              size={25}
              strokeWidth={1}
              color="#666666"
              className="ml-auto"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
