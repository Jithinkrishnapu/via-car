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
  const [open, setOpen] = useState(true);
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
    // Keep dropdown open when searching
  };

  const handleGetVehiclesModel = async()=>{
    console.log("calling in handle")
    setIsLoading(true);
    try {
      const response = await getModelList(vehicle.brand_id,vehicle.category_id)
      console.log("res=======models",response)
      if(response.data){
        setModelList(response.data)
      } else if(response.models) {
        // Handle case where models are directly in response
        setModelList(response)
      } else {
        console.warn("No models found in response:", response);
        setModelList([]);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModelList([]);
    } finally {
      setIsLoading(false);
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
    // Fetch models when component mounts if we have the required IDs
    if (vehicle.brand_id && vehicle.category_id) {
      console.log("calling api on mount")
      handleGetVehiclesModel()
    }
  },[vehicle.brand_id, vehicle.category_id]) // Remove searchValue dependency

  const selectItem = (value: string, modelId?: string, colors?: any[]) => {
    setSelectedValue(value);
    setSearchValue(value);
    // Don't close dropdown after selection
    
    // Store model data in state if provided
    if (modelId) {
      setVehicleModelId(modelId);
    }
    if (colors) {
      setVehicleColors(colors);
    }
    
    // Call the onSelect callback
    if (onSelect) {
      onSelect(value);
    }
  };

  const onInputBlur = () => {
    // Don't close dropdown on blur
  };

  const handleInputFocus = () => {
    // Already open by default
    if (!searchValue && vehicle.brand_id && vehicle.category_id) {
      // Trigger API call when focusing if no search value and we have required IDs
      handleGetVehiclesModel();
    } else if (!vehicle.brand_id || !vehicle.category_id) {
      console.warn("Missing brand_id or category_id for model search");
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

      {/* Removed backdrop - dropdown stays open */}

      {open && (
        <ScrollView bounces={false} className="z-10 bg-white w-full mt-1 rounded-lg max-h-60 border border-gray-200 shadow-lg">
          {isLoading ? (
            <View className="p-4">
              <Text fontSize={16}>Loading models...</Text>
            </View>
          ) : !vehicle.brand_id || !vehicle.category_id ? (
            <View className="px-6 py-4">
              <Text fontSize={14} className="text-sm text-red-500">
                Please select a vehicle brand and category first
              </Text>
            </View>
          ) : filtered?.length > 0 ? (
            filtered?.map((opt, idx) => (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => {
                  console.log("Model selected:", opt.name, opt.id);
                  selectItem(opt.name, opt.id, opt.colors);
                }}
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
              </TouchableOpacity>
            ))
          ) : searchValue.length > 0 ? (
            <View className="px-6 py-4">
              <Text fontSize={14} className="text-sm text-gray-500">
                No models found for "{searchValue}"
              </Text>
            </View>
          ) : modelList?.models?.length === 0 ? (
            <View className="px-6 py-4">
              <Text fontSize={14} className="text-sm text-gray-500">
                No models available for this brand and category
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
