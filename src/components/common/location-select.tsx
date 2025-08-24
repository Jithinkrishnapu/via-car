import React, { useState, useEffect, useCallback } from "react";
import { locations } from "@/constants/locations";
import { useSearchRideStore } from "@/store/useSearchRideStore";
import { AutoComplete } from "./auto-complete";
import { useTranslation } from "react-i18next";

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

  // Dynamically access store value and setter
  const storeValue: string = (store as any)[name] || "";
  const setterName = `set${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const setStoreValue: (val: string) => void =
    (store as any)[setterName] || (() => {});

  const [selectedValue, setSelectedValue] = useState<string>(storeValue);
  const [searchValue, setSearchValue] = useState<string>(storeValue);

  // Sync when store changes externally
  useEffect(() => {
    if (storeValue !== selectedValue || storeValue !== searchValue) {
      setSelectedValue(storeValue);
      setSearchValue(storeValue);
    }
  }, [storeValue]);

  // Clear selection when input is emptied
  useEffect(() => {
    if (searchValue === "" && selectedValue !== "") {
      setSelectedValue("");
      setStoreValue("");
    }
  }, [searchValue]);

  const handleSelectedValueChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      setSearchValue(value);
      setStoreValue(value);
    },
    [setStoreValue]
  );

  return (
    <AutoComplete
      selectedValue={selectedValue}
      onSelectedValueChange={handleSelectedValueChange}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={locations}
      emptyMessage={t("locationSelect.emptyMessage")}
      placeholder={t("locationSelect.placeholder")}
    />
  );
}
