import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { locationsEn } from "@/constants/locations-en";
import { locationsAr } from "@/constants/locations-ar";
import { LocateFixed, Search } from "lucide-react-native";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Text from "./text";
import LocationPin from "../../../public/location-pin.svg";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";
import { usePlacesAutocomplete } from "@/service/common";

interface Props {
  label?: string;
  onSelect?: (value: string) => void;
}

export default function LocationSearch({ label, onSelect }: Props) {
  const { i18n, t } = useTranslation("components");
  // const locations = i18n.language === "ar" ? locationsAr : locationsEn;
  const [locations, setLocations] = useState<any[]>([]);
  const defaultValue = i18n.language === "ar" ? "الخبر" : "Al Khobar";
  const [searchValue, setSearchValue] = useState(defaultValue);

  const labels = useMemo(() => {
    return locations.reduce<Record<string, string>>((acc, loc) => {
      acc[loc.value] = loc.label;
      return acc;
    }, {});
  }, [locations]);


  const fetchLocations = useCallback(async () => {
    const formData = new FormData();
    formData.append("input", searchValue);
    console.log("input========", formData)
    const response = await usePlacesAutocomplete(formData);

    // Safely handle response
    if (response?.data && Array.isArray(response.data)) {
      setLocations(response.data);
    } else {
      console.warn("API returned invalid data:", response);
      setLocations([]);
    }
  }, [searchValue]);

  // ✅ Wrap fetchLocations in debounce
  const debouncedFetchLocations = useCallback(
    debounce(fetchLocations, 400), // Wait 400ms after last keystroke
    [fetchLocations]
  );

  // ✅ Trigger debounced call when searchValue changes
  useEffect(() => {
    debouncedFetchLocations();
    return () => {
      // Cleanup: cancel pending request on unmount or change
      debouncedFetchLocations.cancel();
    };
  }, [debouncedFetchLocations]);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
  };

  const filtered = locations.filter(
    (loc) => true
    // loc.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    // loc.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectItem = (value: string) => {
    setSearchValue(labels[value] || "");
    onSelect?.(value);
  };

  return (
    <View className="relative w-full font-[Kanit-Regular]">
      {label && (
        <Text
          fontSize={17}
          className="text-[17px] text-[#939393] font-[Kanit-Light]"
        >
          {label}
        </Text>
      )}
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
          className="text-lg font-[Kanit-Light] placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[57px] rounded-full pl-16 flex-1"
        />
        <TouchableOpacity
          className="rounded-full bg-[#F1F1F5] size-[57px] items-center justify-center"
          activeOpacity={0.8}
        >
          <LocateFixed className="size-[30px]" strokeWidth={1} />
        </TouchableOpacity>
      </View>

      <ScrollView className="z-10 bg-white w-full mt-1 rounded-lg">
        <View className="px-4 py-2">
          {locations.length > 0 ? (
            locations.map((loc, index) => (
              <TouchableOpacity
                key={loc.placeId}
                className={
                  cn("flex-col", index + 1 < locations.length) &&
                  "border-b border-[#EBEBEB]"
                }
                onPress={() => selectItem(loc.value)}
                activeOpacity={0.8}
              >
                <View className="cursor-pointer py-5 hover:bg-gray-100 rounded-2xl flex-row items-center gap-6">
                  <LocationPin
                    className="w-[19px] h-[22px]"
                    width={19}
                    height={22}
                  />
                  <View className="flex-col">
                    <Text fontSize={14} className="text-sm">
                      {loc.mainText}
                    </Text>
                    <Text fontSize={12} className="text-xs font-[Kanit-Light]">
                      {loc.text}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="px-6 py-4 text-sm text-gray-500">No items.</View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
