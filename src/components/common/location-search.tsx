import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LocateFixed, Search } from "lucide-react-native";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Text from "./text";
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
  const defaultValue = i18n.language === "ar" ? "الخبر" : "Al Khobar";
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const fetchLocations = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("input", searchValue);

      const response = await usePlacesAutocomplete(formData);
      if (Array.isArray(response?.data)) {
        setLocations(response.data);
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
    if (searchValue.length < 2) return;
    debouncedFetchLocations();
    return () => debouncedFetchLocations.cancel();
  }, [searchValue, debouncedFetchLocations]);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
  };

  const selectItem = (loc: any) => {
    onSelect?.(loc);
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
          placeholder={t("locationSearchSelected.label", "Enter full address")}
          autoComplete="off"
          autoCorrect={false}
          className="text-lg font-[Kanit-Light] placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[57px] rounded-full pl-16 flex-1"
        />
        <TouchableOpacity
          className="rounded-full bg-[#F1F1F5] size-[57px] items-center justify-center"
          activeOpacity={0.8}
        >
          <LocateFixed className="size-[30px]" strokeWidth={1} />
        </TouchableOpacity>
      </View>

      {/* 📍 Dropdown List */}
      {locations.length > 0 && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow-1"
          className="bg-white w-full mt-1 rounded-lg max-h-[300px]"
        >
          <View className="px-4 py-2">
            {locations.map((loc, index) => (
              <TouchableOpacity
                key={loc.placeId}
                className={cn(
                  "flex-col rounded-xl transition-all duration-200",
                  index + 1 < locations.length && "border-b border-[#EBEBEB]",
                  selectedValue === loc.placeId &&
                    "bg-[#FFE1E1] border border-[#FF5B5B] shadow-sm"
                )}
                onPress={() => {
                  // setSelectedValue(loc?.placeId);
                  selectItem(loc)}}
                activeOpacity={0.8}
              >
                <View className="py-5 flex-row items-center gap-6">
                  <LocationPin width={19} height={22} />
                  <View className="flex-col">
                    <Text
                      fontSize={14}
                      className={cn(
                        "text-sm",
                        selectedValue === loc.placeId
                          ? "text-[#FF2B2B] font-semibold"
                          : "text-black"
                      )}
                    >
                      {loc.mainText}
                    </Text>
                    <Text
                      fontSize={12}
                      className={cn(
                        "text-xs font-[Kanit-Light]",
                        selectedValue === loc.placeId
                          ? "text-[#FF2B2B]"
                          : "text-[#666666]"
                      )}
                    >
                      {loc.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 🪶 No Results */}
      {locations.length === 0 && searchValue.length > 1 && (
        <View className="px-6 py-4 text-sm text-gray-500">No items.</View>
      )}
    </View>
  );
}
