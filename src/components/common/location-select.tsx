import React, { useState, useEffect, useCallback } from "react";
import { useSearchRideStore } from "@/store/useSearchRideStore";
import { AutoComplete } from "./auto-complete";
import { useTranslation } from "react-i18next";
import { usePlacesAutocomplete } from "@/service/common";
import debounce from "lodash.debounce"; // ✅ Import debounce

interface Props {
  label?: string;
  name: string; // key in the store
  placeholder?: string;
}

export default function LocationSelect({
  label = "",
  name,
  placeholder = "Search location...",
}: Props) {
  const { t } = useTranslation("components");
  const store = useSearchRideStore();

  // State synced with store
  const storeValue: string = (store as any)[name] || "";
  const setterName = `set${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const setStoreValue: (val: string) => void =
    (store as any)[setterName] || (() => {});
  const [selectedValue, setSelectedValue] = useState<string>(storeValue);
  const [searchValue, setSearchValue] = useState<string>("kunnamkulam"); // User's current input
  const [locations, setLocations] = useState<any[]>([]);

  // ✅ Debounced API caller — only fires after user stops typing for 400ms
  const fetchLocations = useCallback(async () => {
    const formData = new FormData();
    formData.append("input", searchValue);
      const response = await usePlacesAutocomplete(formData);

      // Safely handle response
      if (response?.data && Array.isArray(response.data)) {
        setLocations(response.data);
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

  // Sync with external store changes
  useEffect(() => {
    if (storeValue !== selectedValue || storeValue !== searchValue) {
      setSelectedValue(storeValue);
      setSearchValue(storeValue);
    }
  }, [storeValue]);

  // Clear selection if input is empty
  useEffect(() => {
    if (searchValue === "" && selectedValue !== "") {
      setSelectedValue("");
      setStoreValue("");
    }
  }, [searchValue, setStoreValue]);

  // Handle selection from dropdown
  const handleSelectedValueChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      setSearchValue(value);
      setStoreValue(value);
    },
    [setStoreValue]
  );

  // Handle user typing in input
  const handleSearchValueChange = useCallback(
    (value: string) => {
      setSearchValue(value); // Update input immediately
      // Debounced API call happens automatically via useEffect above
    },
    []
  );

  const handleLocationSelect=(item:any)=>{
   if(name == "to"){
    store.setToLatLong(item.lat,item.lng)
   }else{
    store.setFromLatLong(item.lat,item.lng)
   }
  }

  return (
    <AutoComplete
      selectedValue={selectedValue}
      onSelectedValueChange={handleSelectedValueChange}
      handleItemSelect={handleLocationSelect}
      searchValue={searchValue}
      onSearchValueChange={handleSearchValueChange}
      items={locations.map((item) => ({
        value: item?.mainText || "",
        label: item?.mainText || "",
        desc: item?.text || "",
        lat:item?.lat,
        lng:item?.lng
      }))}
      emptyMessage={t("locationSelect.emptyMessage")}
      placeholder={placeholder || t("locationSelect.placeholder")}
    />
  );
}