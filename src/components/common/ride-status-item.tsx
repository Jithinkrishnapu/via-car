import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Text from "./text";
import Avatar from "../ui/avatar";
import { Ban, Download, Hourglass, Star } from "lucide-react-native";
import Direction from "../../../public/direction.svg";
import TickGreen from "../../../public/tick-green.svg";
import { useTranslation } from "react-i18next";

interface Props {
  status: "Pending" | "Cancelled" | "Completed";
}

function RideStatusItem({ status = "Pending" }: Props) {
  const { t } = useTranslation("components");
  return (
    <TouchableOpacity
      className="w-full"
      onPress={() => router.push(`/(your-rides)/ride-details`)}
      activeOpacity={0.8}
    >
      <View className="p-4 rounded-2xl shadow-sm bg-white">
        <View className="flex-row justify-between items-start gap-4 flex-wrap">
          <View className="flex-1 relative">
            <View className="w-max h-[70px] absolute top-0 left-[45px] pt-2">
              <Direction className="object-contain" />
            </View>
            <View className="flex-row items-center gap-12 mb-2">
              <Text fontSize={14} className="text-[14px] font-[Kanit-Regular]">
                {t("rideStatusItem.departureTime")}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {t("rideStatusItem.departureLocation")}
              </Text>
            </View>
            <Text
              fontSize={10}
              className="text-[10px] text-[#666666] font-[Kanit-Regular] mb-2"
            >
              {t("rideStatusItem.duration")}
            </Text>
            <View className="flex-row items-center gap-12">
              <Text fontSize={14} className="text-[14px] font-[Kanit-Regular]">
                {t("rideStatusItem.arrivalTime")}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] font-[Kanit-Regular] flex-1"
              >
                {t("rideStatusItem.arrivalLocation")}
              </Text>
            </View>
          </View>
          <Text
            fontSize={18}
            className="text-lg text-[#00665A] font-[Kanit-Medium]"
          >
            {t("rideStatusItem.price")}
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
          <Text fontSize={12} className="text-[12px] px-2 font-[Kanit-Regular]">
            {t("rideStatusItem.driverName")}
          </Text>
          <Star size={16} fill="#FF9C00" strokeWidth={0} />
          <Text fontSize={10} className="text-[10px] font-[Kanit-Regular]">
            {t("rideStatusItem.rating")}
          </Text>
          {status === "Completed" && (
            <>
              <View className="flex-row items-center gap-2 pl-4">
                <TickGreen width={16} height={16} />
                <Text
                  fontSize={10}
                  className="text-[10px] text-[#15CF74] font-[Kanit-Light]"
                >
                  {t("rideStatusItem.Completed")}
                </Text>
              </View>
              <TouchableOpacity
                className="flex-row items-center gap-2 ml-auto"
                activeOpacity={0.8}
              >
                <Text fontSize={10} className="text-[10px] font-[Kanit-Light]">
                  {t("rideStatusItem.Invoice")}
                </Text>
                <Download width={15} height={15} />
              </TouchableOpacity>
            </>
          )}
          {status === "Pending" && (
            <View className="flex-row items-center gap-2 pl-4">
              <Hourglass color="#cfc615" width={16} height={16} />
              <Text
                fontSize={10}
                className="text-[10px] text-[#cfc615] font-[Kanit-Light]"
              >
                {t("rideStatusItem.Pending")}
              </Text>
            </View>
          )}
          {status === "Cancelled" && (
            <View className="flex-row items-center gap-2 pl-4">
              <Ban color="#cf1515" width={16} height={16} />
              <Text
                fontSize={10}
                className="text-[10px] text-[#cf1515] font-[Kanit-Light]"
              >
                {t("rideStatusItem.Cancelled")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default RideStatusItem;
