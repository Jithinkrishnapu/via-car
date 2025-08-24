import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "./text";
import Avatar from "../ui/avatar";
import { Star } from "lucide-react-native";
import Direction from "../../../public/direction.svg";
import { useTranslation } from "react-i18next";

function RideItem() {
  const { t } = useTranslation();
  return (
    <Pressable onPress={() => router.push(`/(booking)/ride-details`)}>
      <View className="p-4 rounded-2xl shadow-sm bg-white">
        <View className="flex-row justify-between items-start gap-4 flex-wrap">
          <View className="flex-1">
            <View className="flex-row items-center gap-12 mb-2">
              <View className="relative">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular]"
                >
                  {t("booking.rideItem.departureTime")}
                </Text>
                <View className="w-max h-[70px] absolute top-[-5%] right-[-110%] pt-2">
                  <Direction className="object-contain" />
                </View>
              </View>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {t("booking.rideItem.departureLocation")}
              </Text>
            </View>
            <Text
              fontSize={10}
              className="text-[10px] text-[#666666] font-[Kanit-Regular] mb-2"
            >
              {t("booking.rideItem.duration")}
            </Text>
            <View className="flex-row items-center gap-12">
              <Text fontSize={14} className="text-[14px] font-[Kanit-Regular]">
                {t("booking.rideItem.arrivalTime")}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {t("booking.rideItem.arrivalLocation")}
              </Text>
            </View>
          </View>
          <Text
            fontSize={18}
            className="text-lg text-[#00665A] font-[Kanit-Medium]"
          >
            {t("booking.rideItem.price")}
          </Text>
        </View>
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
            {t("booking.rideItem.driverName")}
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
