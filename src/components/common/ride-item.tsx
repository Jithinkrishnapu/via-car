import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "./text";
import Avatar from "../ui/avatar";
import { Star } from "lucide-react-native";
import Direction from "../../../public/direction.svg";
import { useTranslation } from "react-i18next";
import { format, formatDate } from "date-fns";
import { Rides } from "@/types/ride-types";



interface RideItemProps {
  ride?: Rides;
  passengers:string
}

function formatDuration(minutes?: number) {
  if (typeof minutes !== "number" || isNaN(minutes)) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hour${h > 1 ? "s" : ""} ${m} minute${m > 1 ? "s" : ""}`;
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${m} minute${m > 1 ? "s" : ""}`;
}

function RideItem({ ride,passengers }: RideItemProps) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={() =>{
      router.push({ pathname: "/(booking)/ride-details", params: {rideId: ride?.rideId,ride_amount_id:ride?.rideAmount?.id,passengers:passengers} })}}>
      <View className="p-5 rounded-2xl shadow-sm bg-white">
        {/* Header with Price */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text fontSize={12} className="text-[#666666] font-[Kanit-Light] mb-1">
              {formatDuration(ride?.rideAmount?.duration_minutes)}
            </Text>
          </View>
          <Text
            fontSize={20}
            className="text-[#00665A] font-[Kanit-Medium]"
          >
            {ride?.rideAmount.amount ? `SR ${ride?.rideAmount.amount}` : "--"}
          </Text>
        </View>

        {/* Route Section with Better Alignment */}
        <View className="flex-row items-start gap-4 mb-4">
          {/* Time Column */}
          <View className="items-center min-w-[50px]">
            <Text fontSize={16} className="text-[#263238] font-[Kanit-Medium] mb-1">
              {ride?.pickup_stop?.time ? ride.pickup_stop.time.slice(0, 5) : "--:--"}
            </Text>
            <View className="w-[2px] h-8 bg-[#E0E0E0] my-1" />
            <Text fontSize={16} className="text-[#263238] font-[Kanit-Medium]">
              {ride?.drop_stop?.time ? ride.drop_stop.time.slice(0, 5) : "--:--"}
            </Text>
          </View>

          {/* Direction Icon */}
          <View className="items-center justify-center pt-2">
            <Direction width={24} height={60} />
          </View>

          {/* Address Column */}
          <View className="flex-1">
            <View className="mb-3">
              <Text fontSize={12} className="text-[#939393] font-[Kanit-Light] uppercase tracking-wide mb-1">
                {t("booking.rideItem.pickup") || "PICKUP"}
              </Text>
              <Text
                fontSize={15}
                className="text-[#263238] font-[Kanit-Regular] leading-5"
                numberOfLines={2}
              >
                {ride?.pickup_stop?.address || "Pickup location"}
              </Text>
            </View>
            
            <View>
              <Text fontSize={12} className="text-[#939393] font-[Kanit-Light] uppercase tracking-wide mb-1">
                {t("booking.rideItem.drop") || "DROP"}
              </Text>
              <Text
                fontSize={15}
                className="text-[#263238] font-[Kanit-Regular] leading-5"
                numberOfLines={2}
              >
                {ride?.drop_stop?.address || "Drop location"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="border-t border-dashed border-[#CDCDCD] my-4" />

        {/* Driver Info */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Avatar
              source={ride?.driver?.profile_image !== null ? {uri:ride?.driver?.profile_image} : require(`../../../public/profile-image.jpg.webp`)}
              size={32}
              initials="CN"
              className="bg-blue-500"
              textClassName="text-white text-sm"
            />
            <View>
              <Text fontSize={15} className="text-[#263238] font-[Kanit-Medium]">
                {ride?.driver?.name || "Driver"}
              </Text>
              <View className="flex-row items-center gap-1">
                <Star size={14} fill="#FF9C00" strokeWidth={0} />
                <Text fontSize={13} className="text-[#666666] font-[Kanit-Regular]">
                  {t("booking.rideItem.rating") || "4.8"}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Additional Info */}
          <View className="items-end">
            <Text fontSize={12} className="text-[#666666] font-[Kanit-Light]">
              {passengers} {t("booking.rideItem.passengers")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default RideItem;
