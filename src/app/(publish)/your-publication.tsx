import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ChevronLeft, ChevronRight, Home } from "lucide-react-native";
import { Href, router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import CopyRed from "../../../public/copy-red.svg";
import ReturnRed from "../../../public/return-red.svg";
import CancelRed from "../../../public/cancel-red.svg";
import { SvgProps } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { RideDetail } from "@/types/ride-types";
import { useRoute } from "@react-navigation/native";
import { useGetPublishedRideDetails, useUpdateRideStatus } from "@/service/ride-booking";
import { useCreateRideStore } from "@/store/useRideStore";

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
  const [rideDetail, setRideDetail] = useState<RideDetail>()
  const { ride, setSelectedPlaces,ride_id } = useCreateRideStore();

  const menuItems: MenuItems[] = [
    { label: t("yourPublication.itinerary"), route: {pathname:"/(publish)/itinerary",params:{ride_id:rideDetail?.rideId?.id,
      ride_amount_id: rideDetail?.rideAmount?.id
    }} },
    { label: t("yourPublication.route"), route: {pathname:"/(publish)/route-edit",params:{ride_id:rideDetail?.rideId?.id,
      ride_amount_id: rideDetail?.rideAmount?.id
    }} },
    {
      label: t("yourPublication.price"),
      sub: t("yourPublication.priceSub"),
      route: {pathname:"/(publish)/show-pricing-edit",params:{ride_id:rideDetail?.rideId?.id,
        ride_amount_id: rideDetail?.rideAmount?.id
      }},
    },
    {
      label: t("yourPublication.seatOptions"),
      route: {pathname:"/(publish)/passenger-options",params:{ride_id:rideDetail?.rideId?.id,
        ride_amount_id: rideDetail?.rideAmount?.id
      }},
    },
  ];

  const handleCancelRide = async () => {
    const req = {
      ride_id: ride_id,
      status: 5
    }
    const response = await useUpdateRideStatus(req)
    if (response) {
      Alert.alert("Ride Cancelled")
    }
  }

  const bottomActions: MenuItems[] = [
    // {
    //   label: t("yourPublication.duplicate"),
    //   icon: CopyRed,
    //   route: "/(publish)/your-publication",
    // },
    {
      label: t("yourPublication.publishReturn"),
      icon: ReturnRed,
      route: "/(publish)/date-return",
    },
    {
      label: t("yourPublication.cancel"),
      icon: CancelRed,
      route: "/(publish)/your-publication",
    },
    {
      label: "Back Home",
      icon: Home,
      route: "/(tabs)/book",
    }
  ];

  
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
                onPress={() => {
                  if(act.label == "Back Home"){
                    setSelectedPlaces([])
                  }else if(act.label == t("yourPublication.cancel")){
                    handleCancelRide()
                  }
                  router.push(act.route)}}
                activeOpacity={0.8}
                className="flex-row items-center gap-2"
              >
                {act.icon && <act.icon color={"red"} width={16} height={16} />}
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
