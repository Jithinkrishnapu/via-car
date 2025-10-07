import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import LocationSearchSelected from "@/components/common/location-search-selected";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";

function PickupSelected() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore()
  if (!loaded) return null;
  return (
    <View className="flex-auto h-full pt-16 bg-white">
      <View className="flex-row items-center gap-4 mb-6 px-6">
        <TouchableOpacity
          className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} />
        </TouchableOpacity>
        <Text
          fontSize={25}
          className="text-[25px] text-black font-[Kanit-Medium] flex-1"
        >
          {t("pickupSelected.title")}
        </Text>
      </View>
      <LocationSearchSelected
        initialRegion={{
          latitude: ride.pickup_lat,
          longitude: ride.pickup_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        onContinue={(location) => {
          setRideField("pickup_lat",location.lat)
          setRideField("pickup_lng",location.lng)
          setRideField("pickup_address",location.address)
          router.push("/(publish)/dropoff");
        }}
      />
    </View>
  );
}

export default PickupSelected;
