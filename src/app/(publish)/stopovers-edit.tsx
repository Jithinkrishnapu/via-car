import { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import Building from "../../../public/building.svg";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useGetPopularPlaces } from "@/service/ride-booking";
import { useCreateRideStore } from "@/store/useRideStore";

const initialRoutes = [
  { id: "1", cityIndex: 0, defaultChecked: true },
  { id: "2", cityIndex: 1, defaultChecked: false },
  { id: "3", cityIndex: 2, defaultChecked: false },
];

function Stopovers() {
  const loaded = useLoadFonts();
  const { t, i18n } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [cities] = useState(initialRoutes);
  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore()
  const [checkedIds, setCheckedIds] = useState<string[]>(
    initialRoutes.filter((c) => c.defaultChecked).map((c) => c.id)
  );

  const toggleChecked = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleStopOvers =async()=>{
    const request ={
      "pickup_lat": ride.pickup_lat,
      "pickup_lng": ride.pickup_lng,
      "dropoff_lat": ride.destination_lat,
      "dropoff_lng": ride.destination_lng,
      "type": "city"
    }
    const response = await useGetPopularPlaces(request)
    console.log("res========popular",response)
  }

  useEffect(() => {
    handleStopOvers();
  }, []);

  if (!loaded) return null;
  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="px-6 pt-16 pb-10 flex flex-col gap-4">
        {/* Header */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] flex-1 leading-tight"
          >
            {t("stopoversEdit.title")}
          </Text>
        </View>

        {/* City List */}
        <View className="flex-col gap-[14px] max-w-lg w-full self-center">
          {cities.map(({ id, cityIndex }) => {
            const isChecked = checkedIds.includes(id);
            return (
              <TouchableOpacity
                key={id}
                onPress={() => toggleChecked(id)}
                className={`flex-row items-center justify-between border rounded-2xl px-6 py-4 ${
                  isChecked
                    ? "border-[#69D2A5] bg-[#F1FFF9]"
                    : "border-[#EBEBEB] bg-white"
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Building width={22} height={22} />
                  <Text
                    fontSize={15}
                    className="text-[15px] font-[Kanit-Regular]"
                  >
                    {t(`stopoversEdit.cities.${cityIndex}`)}
                  </Text>
                </View>
                {isChecked && (
                  <View className="w-6 h-6">
                    <CheckGreen width={24} height={24} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Fixed Footer Buttons */}
      <View className="absolute bottom-8 left-0 right-0 px-6 flex-row gap-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center border border-[#EBEBEB] rounded-full h-[55px] gap-[4px]"
          onPress={() => router.push("/(publish)/edit-city")}
          activeOpacity={0.8}
        >
          <Plus size={20} className="mr-2" />
          <Text
            fontSize={18}
            className="text-[18px] text-[#3F3C3C] font-[Kanit-Regular]"
          >
            {t("stopoversEdit.addCity")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(publish)/stopovers-preview-edit")}
          className="flex-1 items-center justify-center bg-[#FF4848] rounded-full h-[55px]"
          activeOpacity={0.8}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("stopoversEdit.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Stopovers;
