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
import { vehicles } from "@/constants/vehicles";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { getBrandList } from "@/service/vehicle";
import { useStore } from "@/store/useStore";

interface Props {
  label?: string;
  name: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
}

export default function VehicleSearch({
  label,
  name,
  placeholder = "Search vehicles…",
  onSelect,
}: Props) {
  const { t } = useTranslation("components");
  const { swap } = useDirection();
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleList,setVehiclesList] = useState([]);
  const inputRef = useRef<View>(null);
  const {setVehicle} = useStore()

  const labels = useMemo(() => {
    return vehicles.reduce<Record<string, string>>((acc, v) => {
      acc[v.value] = v.label;
      return acc;
    }, {});
  }, []);

  const handleGetVehicles = async()=>{
    console.log("calling in handle")
    const response = await getBrandList(searchValue)
    console.log("res=======vehicles",response)
    if(response.data){
      setVehiclesList(response.data)
    }
  }

  useEffect(()=>{
    console.log("calling api")
    handleGetVehicles()
  },[searchValue])

  const handleInputChange = (text: string) => {
    setSearchValue(text);
    setSelectedValue("");
    setOpen(true);
  };

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          v.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          v.value.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  const selectItem = (value: string) => {
    setSelectedValue(value);
    setSearchValue(labels[value] || value);
    setOpen(false);
    onSelect?.(value);
  };

  const onInputBlur = () => {
    // delay to allow selection
    setTimeout(() => setOpen(false), 150);
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
      <View className="flex-row items-center relative mb-1">
        <View className="absolute left-5 z-10">
          <Search className="size-[20px]" strokeWidth={1} color="black" />
        </View>
        <TextInput
          allowFontScaling={false}
          value={searchValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={onInputBlur}
          className={cn(
            "text-lg font-Kanit-Light placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[50px] rounded-full pl-16 flex-1"
          )}
        />
      </View>

      <ScrollView bounces={false} className="z-10 bg-white w-full mt-1 rounded-lg max-h-60">
        {isLoading ? (
          <View className="p-4">
            <Text fontSize={16}>Loading...</Text>
          </View>
        ) : vehicleList?.brands?.length > 0 ? (
          vehicleList?.brands?.map((opt, idx) => (
            <Pressable
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => {
                setVehicle(opt.id,"")
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
        ) : (
          <View className="px-6 py-4">
            <Text fontSize={14} className="text-sm text-gray-500">
              No items.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
