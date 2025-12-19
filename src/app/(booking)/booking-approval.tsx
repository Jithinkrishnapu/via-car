import { useEffect, useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Link, router } from "expo-router";
import { ChevronLeft, ChevronRight, Circle, Star, Verified } from "lucide-react-native";
import Text from "@/components/common/text";
import MapComponent from "@/components/ui/map-view";
import CheckGreen from "../../../public/check-green.svg";

import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { placeRoutes, useBookingApproval } from "@/service/ride-booking";
import Chat from "../../../public/chat.svg";
import Avatar from "@/components/ui/avatar";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

function BookingApproval() {
  // -------------------- Hooks --------------------
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const route = useRoute();
  const rideDetail = JSON.parse(route?.params?.item);

  console.log("rideDetail==================",rideDetail)

  const fmtUTC = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes()
    ).padStart(2, '0')}`;
  };


  const handleApprove =async(booking_id:number,type:number)=>{
    const req = {
      "booking_id": booking_id,
      "type": type
    }
    const res = await useBookingApproval(req)
    if(res){
      console.log(res,'res===========================',req)
    }
  }


  // -------------------- Render --------------------
  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white">
      {/* -------------------- Map Section -------------------- */}
      <View className="flex-1 relative">
        {/* Back Button */}
        <TouchableOpacity
          className={swap(
            "absolute top-12 left-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center",
            "absolute top-12 right-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          )}
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
        </TouchableOpacity>

        {/* Map Component */}
      <View className="h-full" >
      <MapComponent
        />
      </View>
      </View>

      {/* -------------------- Route Selection -------------------- */}
      <View className="bg-white rounded-t-3xl h-[50%] px-[28px] z-10">
        
      <View className="px-4 mt-3">
                <View className="flex-row items-start">
                    {/* ----  vertical line + dots  ---- */}
                    <View className="items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <View className="w-0.5 h-16 bg-gray-300 my-1" />
                        <View className="w-2 h-2 rounded-full bg-red-500" />
                    </View>

                    {/* ----  city / time labels  ---- */}
                    <View className="ml-3 gap-3 flex-1">
                        <View className='items-start gap-2' >
                            <Text className="text-xs text-gray-500">{"Pick up"}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{rideDetail?.pickupAddress}</Text>
                        </View>

                        {/* duration */}
                       

                        <View className='items-start gap-2' >
                            <Text className="text-xs text-gray-500">{"Drop"}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{rideDetail?.dropAddress}</Text>
                        </View>
                    </View>

                    {/* ----  price  ---- */}
                    <View className="">
                    <View className='items-start gap-2' >
                            <Text className="text-xs text-gray-500">{"Pickup Time"}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{fmtUTC(rideDetail?.pickupTime)}</Text>
                        </View>
                    <View className='items-start gap-2' >
                            <Text className="text-xs text-gray-500">{"Drop Time"}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{fmtUTC(rideDetail?.dropTime)}</Text>
                        </View>
                    </View>
                </View>
            </View>

        <View className=" py-6 rounded-none bg-white">
              <View className="flex-row items-center justify-between">
                <Link href={`/(tabs)/user-profile`} className="flex-row items-center">
                  <View className="w-[40px] ">
                    <Avatar
                      source={require(`../../../public/profile-img.png`)}
                      size={40}
                      initials="CN"
                    />
                  </View>
                  <View>
                    <View className="flex-row mb-2 items-center gap-2">
                      <Text
                        fontSize={14}
                        className="text-[14px] text-black mb-1 px-2 font-[Kanit-Regular]"
                      >
                        {rideDetail?.passengers?.[1].name || rideDetail?.passengers?.[0].name}
                      </Text>
                      <Verified width={15} height={15} />
                    </View>
                  </View>
                </Link>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    className="rounded-full size-[38px] border border-[#EBEBEB] flex-row items-center justify-center"
                    activeOpacity={0.8}
                    onPress={() => router.push({pathname:"/(inbox)/chat",params:{driver_id:rideDetail?.passengers?.[1].id || rideDetail?.passengers?.[0].id,driver_name:rideDetail?.passengers?.[1].name || rideDetail?.passengers?.[0].name}})}
                  >
                    <Chat width={15} height={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        <View className="flex-row items-center justify-between" > 
          <Text className="text-black text-[16px] font-[Kanit-Regular]" >For {rideDetail?.passengers?.length} Seats</Text>
          <Text className="text-black text-[16px] font-[Kanit-Regular]" >SR {rideDetail?.totalAmount}</Text>
        </View>

        {/* Continue Button */}
       <View className="flex-1 justify-end" >
       <View className=" flex-row w-full gap-2 items-center py-5">
          <TouchableOpacity
            className="bg-white flex-1 w-full border border-[#FF4848] rounded-full h-[55px] flex-row items-center justify-center"
            onPress={() =>handleApprove(rideDetail?.id,2)}
            activeOpacity={0.8}
          >
            <Text
              fontSize={20}
              className="text-xl text-[#FF4848] font-[Kanit-Regular]"
            >
              Decline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FF4848] flex-1 w-full rounded-full h-[55px] flex-row items-center justify-center"
            onPress={() => handleApprove(rideDetail?.id,1)}
            activeOpacity={0.8}
          >
            <Text
              fontSize={20}
              className="text-xl text-white font-[Kanit-Regular]"
            >
              {"Approve"}
            </Text>
          </TouchableOpacity>
        </View>
       </View>
      </View>
    </View>
  );
}

export default BookingApproval;
