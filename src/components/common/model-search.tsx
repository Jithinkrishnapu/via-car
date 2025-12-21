import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { ChevronRight, ChevronLeft, Search } from "lucide-react-native";
import Text from "./text";
import HistoryIcon from "../../../public/history.svg";
import { models } from "@/constants/models";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { getModelList } from "@/service/vehicle";
import { useStore } from "@/store/useStore";

interface Props {
  label?: string;
  name: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
}

export default function ModelSearch({
  label,
  name,
  placeholder = "Enter the vehicle model name",
  onSelect,
}: Props) {
  const { t } = useTranslation("components");
  const { swap } = useDirection();
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modelList, setModelList] = useState([]);
  const inputRef = useRef<View>(null);
  const {vehicle,setVehicleColors,setVehicleModelId} = useStore()

  const labels = useMemo(() => {
    return models.reduce<Record<string, string>>((acc, m) => {
      acc[m.value] = m.label;
      return acc;
    }, {});
  }, []);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
    setSelectedValue("");
    setOpen(true);
  };

  const handleGetVehiclesModel = async()=>{
    console.log("calling in handle")
    const response = await getModelList(vehicle.brand_id,vehicle.category_id)
    console.log("res=======models",response)
    if(response.data){
      setModelList(response.data)
    }
  }

  const filtered = useMemo(
    () =>
      modelList?.models?.filter(
        (m) =>
          m.name.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue,modelList]
  );

  useEffect(()=>{
    // Only fetch if we have the required IDs and the list is empty
    if (vehicle.brand_id && vehicle.category_id && modelList.length === 0) {
      console.log("calling api")
      handleGetVehiclesModel()
    }
  },[vehicle.brand_id, vehicle.category_id]) // Remove searchValue dependency

  const selectItem = (value: string) => {
    setSelectedValue(value);
    setSearchValue(labels[value] || value);
    setOpen(false);
    onSelect?.(value);
  };

  const onInputBlur = () => {
    // Increased timeout to allow for item selection
    setTimeout(() => setOpen(false), 200);
  };

  const handleInputFocus = () => {
    setOpen(true);
    if (!searchValue) {
      // Trigger API call when focusing if no search value
      handleGetVehiclesModel();
    }
  };

  return (
    <View className="relative w-full font-Kanit-Regular">
      {label && (
        <Text
          fontSize={17}
          className="text-[17px] text-[#939393] font-Kanit-Light mb-1"
        >
          {label}
        </Text>
      )}
      <View className="flex-row items-center relative mb-2">
        <View className="absolute left-5 z-10">
          <Search size={20} color="black" />
        </View>
        <TextInput
          allowFontScaling={false}
          value={searchValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={handleInputFocus}
          onBlur={onInputBlur}
          className={cn(
            "text-lg font-Kanit-Light placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[50px] rounded-full pl-16 flex-1"
          )}
        />
      </View>

      {/* Backdrop to close dropdown when tapping outside */}
      {open && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: -1000,
            right: -1000,
            bottom: -1000,
            zIndex: 5,
          }}
          onPress={() => setOpen(false)}
        />
      )}

      {open && (
        <ScrollView bounces={false} className="z-10 bg-white w-full mt-1 rounded-lg max-h-60 border border-gray-200 shadow-lg">
          {isLoading ? (
            <View className="p-4">
              <Text fontSize={16}>Loading...</Text>
            </View>
          ) : filtered?.length > 0 ? (
            filtered?.map((opt, idx) => (
              <Pressable
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => {
                  setVehicleColors(opt.colors)
                  setVehicleModelId(opt.id)
                  selectItem(opt.name)}}
                className={cn(
                  "flex-row items-center justify-between px-4 py-4",
                  idx + 1 < filtered.length && "border-b border-[#EBEBEB]"
                )}
              >
                <View className="flex-row items-center gap-2">
                  <HistoryIcon width={20} height={20} />
                  <View className="flex-1">
                    <Text fontSize={14} className="text-sm">
                      {opt.name}
                    </Text>
                    {/* <Text
                      fontSize={16}
                      className="text-xs font-[Kanit-Light] text-[#666666]"
                    >
                      {opt.desc}
                    </Text> */}
                  </View>
                </View>
                {swap(
                  <ChevronRight size={20} color="#AAAAAA" />,
                  <ChevronLeft size={20} color="#AAAAAA" />
                )}
              </Pressable>
            ))
          ) : searchValue.length > 0 ? (
            <View className="px-6 py-4">
              <Text fontSize={14} className="text-sm text-gray-500">
                No models found for "{searchValue}"
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
