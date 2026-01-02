import { router } from "expo-router";
import LocationSearchSelected from "@/components/common/location-search-selected";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateRideStore } from "@/store/useRideStore";
import { useEffect } from "react";
import * as Location from "expo-location";

function PickupSelected() {
  const loaded = useLoadFonts();
  const { ride, setRideField } = useCreateRideStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
      }
    })();
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1">
        <LocationSearchSelected
          initialRegion={{
            latitude: ride.pickup_lat,
            longitude: ride.pickup_lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onContinue={(location) => {
            setRideField("pickup_lat", location.latitude);
            setRideField("pickup_lng", location.longitude);
            setRideField("pickup_address", location.address || "");
            router.push("/(publish)/dropoff");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default PickupSelected;