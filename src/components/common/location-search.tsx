import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LocateFixed, Search, Check } from "lucide-react-native";
import { ScrollView, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Location from 'expo-location';
import Text from "./text";
import { snackbarManager } from '@/utils/snackbar-manager';
import LocationPin from "../../../public/location-pin.svg";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";
import { usePlacesAutocomplete } from "@/service/common";
import { LocationData } from "@/types/ride-types";

interface Props {
  label?: string;
  onSelect?: (value: LocationData) => void;
}

export default function LocationSearch({ onSelect }: Props) {
  const { i18n, t } = useTranslation("components");

  const [locations, setLocations] = useState<any[]>([]);
  const defaultValue = i18n.language === "ar" ? "" : "";
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Rate limiting for geocoding
  const lastGeocodeTimeRef = useState(0)[0];

  const fetchLocations = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("input", searchValue);

      const response = await usePlacesAutocomplete(formData);
      if (Array.isArray(response?.data)) {
        setLocations(response.data);
        setShowDropdown(true);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  }, [searchValue]);

  const debouncedFetchLocations = useCallback(
    debounce(fetchLocations, 400),
    [fetchLocations]
  );

  useEffect(() => {
    if (searchValue.length < 2) {
      setShowDropdown(false);
      return;
    }
    debouncedFetchLocations();
    return () => debouncedFetchLocations.cancel();
  }, [searchValue, debouncedFetchLocations]);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
    setShowDropdown(true);
    // Clear selection if user modifies the search
    if (selectedLocation && text !== selectedLocation.mainText) {
      setSelectedLocation(null);
    }
  };

  const selectItem = (loc: any) => {
    setSelectedLocation(loc);
    setSearchValue(loc.mainText);
    setShowDropdown(false);
    onSelect?.(loc);
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        snackbarManager.showError(t('Please grant location permission to use this feature'));
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address with error handling
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          
          // Format address similar to API response
          const mainText = [address.street, address.name].filter(Boolean).join(', ') || 
                          [address.city, address.region].filter(Boolean).join(', ') ||
                          'Current Location';
          
          const fullText = [
            address.street,
            address.name,
            address.city,
            address.region,
            address.country,
          ].filter(Boolean).join(', ');

          const locationData: LocationData = {
            placeId: `current_${Date.now()}`,
            mainText,
            text: fullText,
            lat: latitude,
            lng: longitude,
          };

          // Set as selected location
          setSelectedLocation(locationData);
          setSearchValue(mainText);
          setShowDropdown(false);
          onSelect?.(locationData);
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed, using coordinates:', geocodeError);
        
        // Fallback: use coordinates if geocoding fails
        const locationData: LocationData = {
          placeId: `current_${Date.now()}`,
          mainText: 'Current Location',
          text: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          lat: latitude,
          lng: longitude,
        };

        setSelectedLocation(locationData);
        setSearchValue('Current Location');
        setShowDropdown(false);
        onSelect?.(locationData);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      snackbarManager.showError(t('Failed to get current location. Please try again.'));
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View className="relative w-full font-[Kanit-Regular]">

      {/* 🔍 Input Section */}
      <View className="flex-row items-center gap-4 relative">
        <View className="absolute left-5 my-auto z-[1]">
          <Search className="size-[20px]" strokeWidth={1} color="black" />
        </View>
        <TextInput
          allowFontScaling={false}
          value={searchValue}
          onChangeText={handleInputChange}
          onFocus={() => setShowDropdown(locations.length > 0)}
          placeholder={t("locationSearchSelected.label", "Enter full address")}
          autoComplete="off"
          autoCorrect={false}
          className={cn(
            "text-lg font-[Kanit-Light] placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[57px] rounded-full pl-16 flex-1"
          )}
        />
        <TouchableOpacity
          className="rounded-full bg-[#F1F1F5] size-[57px] items-center justify-center"
          activeOpacity={0.8}
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#FF4848" />
          ) : (
            <LocateFixed className="size-[30px]" strokeWidth={1} color={selectedLocation ? "#FF4848" : "#000"} />
          )}
        </TouchableOpacity>
      </View>

      {/* ✅ Selected Location Indicator */}
      {selectedLocation && !showDropdown && (
        <View className="mt-2 px-4 py-3 bg-[#ff484835] rounded-lg flex-row items-center gap-3">
          <View className="bg-[#FF4848] rounded-full p-1">
            <Check className="size-[16px]" strokeWidth={3} color="white" />
          </View>
          <View className="flex-1">
            <Text fontSize={13} className="text-[#FF4848] font-semibold">
              Selected: {selectedLocation.mainText}
            </Text>
            <Text fontSize={11} className="text-[#FF4848] font-[Kanit-Light]">
              {selectedLocation.text}
            </Text>
          </View>
        </View>
      )}

      {/* 📍 Dropdown List */}
      {showDropdown && locations.length > 0 && (
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow-1"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustsScrollIndicatorInsets={false}
          className="bg-white w-full mt-1 rounded-lg max-h-[300px] shadow-lg"
        >
          <View className="px-4 py-2">
            {locations.map((loc, index) => (
              <TouchableOpacity
                key={loc.placeId}
                className={cn(
                  "flex-col rounded-xl transition-all duration-200",
                  index + 1 < locations.length && "border-b border-[#EBEBEB]",
                  selectedLocation?.placeId === loc.placeId &&
                    "bg-[#fff] border border-[#FF4848]"
                )}
                onPress={() => selectItem(loc)}
                activeOpacity={0.8}
              >
                <View className="py-5 px-2 flex-row items-center gap-6">
                  <LocationPin width={19} height={22} />
                  <View className="flex-1 flex-col">
                    <Text
                      fontSize={14}
                      className={cn(
                        "text-sm",
                        selectedLocation?.placeId === loc.placeId
                          ? "text-[#000] font-semibold"
                          : "text-black"
                      )}
                    >
                      {loc.mainText}
                    </Text>
                    <Text
                      fontSize={12}
                      className={cn(
                        "text-xs font-[Kanit-Light]",
                        selectedLocation?.placeId === loc.placeId
                          ? "text-[#558B5B]"
                          : "text-[#666666]"
                      )}
                    >
                      {loc.text}
                    </Text>
                  </View>
                  {selectedLocation?.placeId === loc.placeId && (
                    <View className="bg-[#FF4848] rounded-full p-1">
                      <Check className="size-[10px]" strokeWidth={3} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 🪶 No Results */}
      {showDropdown && locations.length === 0 && searchValue.length > 1 && (
        <View className="px-6 py-4 text-sm text-gray-500">No items.</View>
      )}
    </View>
  );
}