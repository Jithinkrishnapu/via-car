import { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { ChevronLeft, Plus } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import Building from "../../../public/building.svg";
import CheckGreen from "../../../public/check-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { useGetPopularPlaces } from "@/service/ride-booking";
import { useRoute } from "@react-navigation/native";

function Stopovers() {
  const loaded = useLoadFonts();
  const { t, i18n } = useTranslation("components");
  const { isRTL } = useDirection();
  const [places, setPlaces] = useState<any[]>([]);
  const { ride, setSelectedPlaces, selectedPlaces, polyline } = useCreateRideStore();
  const route = useRoute()

  console.log(places)

  const handleStopOvers = async () => {
    const request = {
      pickup_lat: ride.pickup_lat,
      pickup_lng: ride.pickup_lng,
      dropoff_lat: ride.destination_lat,
      dropoff_lng: ride.destination_lng,
      encoded_polyline: polyline,
      type: "city",
    };

    try {
      const response = await useGetPopularPlaces(request);
      const newPlaces = response?.data?.places ?? [];
    
      setPlaces(curr => {
        const merged = [...curr, ...newPlaces];
    
        if (route?.params?.location) {
          // route.params.location is a JSON-stringified array
          const loc = JSON.parse(route.params.location); // => [{…}]
          merged.push(...loc);                           // add the objects, not the string
        }
        return merged;
      });
    } catch (err) {
      console.error('Error fetching stopovers:', err);
    }
  };

  useEffect(() => {
    handleStopOvers();
  }, []);

  const toggleStopover = (loc: any) => {
    const exists = selectedPlaces.some((p) => p.lat === loc.lat);
    if (exists) {
      // Remove place
      setSelectedPlaces(selectedPlaces.filter((p) => p.lat !== loc.lat));
    } else {
      // Add place
      setSelectedPlaces([
        ...selectedPlaces,
        { lat: loc.lat, lng: loc.lng, address: loc.mainText },
      ]);
    }
  };

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
            {t("stopovers.title")}
          </Text>
        </View>

        {/* Stopover List */}
        <View className="flex-col gap-[14px] max-w-lg w-full self-center">
          {places?.map((loc) => {
            const isChecked = selectedPlaces.some((p) => p.lat === loc.lat);
            return (
              <TouchableOpacity
                key={loc.lat}
                onPress={() => toggleStopover(loc)}
                className={`flex-row items-center justify-between border rounded-2xl px-6 py-4 ${isChecked
                    ? "border-[#69D2A5] bg-[#F1FFF9]"
                    : "border-[#EBEBEB] bg-white"
                  }`}
                activeOpacity={0.8}
              >
                <View className="flex-row w-[95%] items-center gap-2">
                  <Building width={22} height={22} />
                  <Text
                    fontSize={15}
                    className="text-[15px] text-wrap w-[90%] font-[Kanit-Regular]"
                  >
                    {loc.mainText}
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

      {/* Footer */}
      <View className="absolute bottom-8 left-0 right-0 px-6 flex-row gap-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center border border-[#EBEBEB] rounded-full h-[55px] gap-[4px]"
          onPress={() => router.push({pathname:"/(publish)/add-city",params:{place:route?.params?.location,path:'/(publish)/stopovers'}})}
          activeOpacity={0.8}
        >
          <Plus size={20} className="mr-2" />
          <Text
            fontSize={18}
            className="text-[18px] text-[#3F3C3C] font-[Kanit-Regular]"
          >
            {t("stopovers.addCity")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(publish)/stopovers-preview")}
          className="flex-1 items-center justify-center bg-[#FF4848] rounded-full h-[55px]"
          activeOpacity={0.8}
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

export default Stopovers;
