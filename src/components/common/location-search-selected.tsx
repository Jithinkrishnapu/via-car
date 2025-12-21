import { useEffect, useState, useCallback } from "react";
import { CircleHelp, ArrowLeft } from "lucide-react-native";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import { Region } from 'react-native-maps';
import MapComponent from "../ui/map-view";
import LocationPickerComponent from "./location-picker-component";
import { useGetExactLocation } from "@/service/ride-booking";
import { router } from "expo-router";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Props {
  onContinue?: (location: LocationData) => void;
  initialRegion: Region;
  onBack?: () => void;
}

export default function LocationSearchSelected({ 
  onContinue, 
  initialRegion, 
  onBack 
}: Props) {
  const { t } = useTranslation("components");
  
  // State management
  const [location, setLocation] = useState<LocationData | null>(null);
  const [markers, setMarkers] = useState<any>(null);
  const [whyExact, setWhyExact] = useState<boolean>(false);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exact location markers
  const handleGetExactLocation = useCallback(async () => {
    if (!initialRegion?.latitude || !initialRegion?.longitude) {
      return;
    }
    
    // Prevent duplicate calls
    if (isLoadingMarkers) {
      return;
    }
    
    setIsLoadingMarkers(true);
    setError(null);
    
    try {
      const request = {
        lat: initialRegion.latitude,
        lng: initialRegion.longitude,
        radius: 5000,
        limit: 20
      };
      
      const response = await useGetExactLocation(request);
      
      if (response?.data?.places) {
        setMarkers(response.data.places);
      } else {
        setError(t("locationSearchSelected.noLocationsFound", "No locations found nearby"));
      }
    } catch (err) {
      console.error("Error fetching exact location:", err);
      setError(t("locationSearchSelected.errorFetchingLocations", "Failed to load nearby locations"));
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [initialRegion?.latitude, initialRegion?.longitude, t]);

  // Fetch markers when whyExact becomes true for the first time
  useEffect(() => {
    if (whyExact && !markers && !isLoadingMarkers) {
      handleGetExactLocation();
    }
  }, [whyExact, markers, isLoadingMarkers, handleGetExactLocation]);

  // Navigation handlers
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    if (!location) {
      // Optionally show a warning that no location is selected
      console.warn("No location selected");
      return;
    }
    
    onContinue?.(location);
  };

  const handleLocationSelected = (selectedLocation: LocationData) => {
    setLocation(selectedLocation);
    setError(null); // Clear any previous errors
  };

  const handleMarkerPress = (loc: any, _index: number, name: string) => {
    setLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: name
    });
    setError(null);
  };

  return (
    <View className="relative flex-1 font-[Kanit-Regular]">
      {/* Back Button */}
      <View className="absolute top-12 left-6 z-20">
        <TouchableOpacity
          onPress={handleBack}
          className="bg-white rounded-full p-3 shadow-lg"
          activeOpacity={0.8}
        >
          <ArrowLeft className="size-[20px]" strokeWidth={2} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-auto flex-col gap-4 mt-4 h-full">
        {/* Why Exact Location Button */}
        <TouchableOpacity
          onPress={() => setWhyExact(true)}
          className="border border-[#EBEBEB] rounded-full h-max w-max mx-auto mb-4 flex-row items-center gap-[15px] px-[10px] py-[6px]"
          activeOpacity={0.8}
        >
          <CircleHelp className="size-[14px]" strokeWidth={1} />
          <Text
            fontSize={12}
            className="text-[12px] font-[Kanit-Light] text-[#3C3F4E]"
          >
            {t("locationSearchSelected.whyExactLocation", "Why an exact location?")}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View className="mx-6 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoadingMarkers && (
          <View className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <ActivityIndicator size="large" color="#FF4848" />
          </View>
        )}

        {/* Map Component - Conditional Rendering */}
        {whyExact ? (
          <MapComponent 
            onMarkerPress={handleMarkerPress} 
            markers={markers} 
          />
        ) : (
          <LocationPickerComponent 
            initialRegion={initialRegion} 
            onLocationSelected={handleLocationSelected}
            confirmButtonText={t("locationSearchSelected.selectLocation", "Select This Location")}
          />
        )}
      </View>

      {/* Continue Button */}
      <View className="absolute right-0 bottom-10 left-0 px-6 z-10">
        <TouchableOpacity
          className={`rounded-full w-full h-[55px] items-center justify-center ${
            location ? 'bg-[#FF4848]' : 'bg-gray-400'
          }`}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!location}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("locationSearchSelected.continue", "Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}