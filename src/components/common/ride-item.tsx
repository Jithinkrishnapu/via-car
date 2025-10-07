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
}

function formatDuration(minutes?: number) {
  if (typeof minutes !== "number" || isNaN(minutes)) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} hour${h > 1 ? "s" : ""} ${m} minute${m > 1 ? "s" : ""}`;
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${m} minute${m > 1 ? "s" : ""}`;
}

function RideItem({ ride }: RideItemProps) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={() =>{
      router.push({ pathname: "/(booking)/ride-details", params: {rideId: ride?.rideId,ride_amount_id:ride?.rideAmount?.id} })}}>
      <View className="p-4 rounded-2xl shadow-sm bg-white">
        <View className="flex-row justify-between items-start gap-4 flex-wrap">
          <View className="flex-1">
            <View className="flex-row items-center gap-12 mb-2">
              <View className="relative">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular]"
                >
                  {ride?.pickup_stop?.time ? ride.pickup_stop.time.slice(0, 5) : "--:--"}
                </Text>
                <View className="w-max h-[70px] absolute top-[-5%] right-[-110%]">
                  <Direction className="object-contain" />
                </View>
              </View>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {ride?.pickup_stop?.address}
              </Text>
            </View>
            <View className="flex-row items-center gap-12">
              <Text fontSize={14} className="text-[14px] font-[Kanit-Regular]">
                {ride?.drop_stop?.time ? ride.drop_stop.time.slice(0, 5) : "--:--"}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {ride?.drop_stop?.address}
              </Text>
            </View>
          </View>
          <Text
            fontSize={18}
            className="text-lg text-[#00665A] font-[Kanit-Medium]"
          >
            {ride?.rideAmount.amount ? `SR ${ride?.rideAmount.amount}`  :"--"}
          </Text>
        </View>
        <Text
              fontSize={12}
              className="text-[14px] text-[#666666] font-[Kanit-Regular] my-2"
            >
              {formatDuration(ride?.rideAmount?.duration_minutes)}
            </Text>
        <View className="border-t border-dashed border-[#CDCDCD] my-3" />
        <View className="flex-row items-center gap-2 py-1">
          <Avatar
            source={require(`../../../public/profile-img.png`)}
            size={25}
            initials="CN"
            className="bg-blue-500"
            textClassName="text-white text-lg"
          />
          <Text fontSize={14} className="text-[14px] px-2 font-[Kanit-Regular]">
            {ride?.driver?.name}
          </Text>
          <Star size={16} fill="#FF9C00" strokeWidth={0} />
          <Text fontSize={14} className="text-[14px] font-[Kanit-Regular]">
            {t("booking.rideItem.rating")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default RideItem;
