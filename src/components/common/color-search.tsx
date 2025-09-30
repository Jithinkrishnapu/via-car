import React, { useState, useMemo, useRef } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { ChevronRight, ChevronLeft, Search } from "lucide-react-native";
import Text from "./text";
import { colors } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useStore } from "@/store/useStore";
import namer from 'color-namer';


interface Props {
  label?: string;
  name: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
}

export default function ColorSearch({
  label,
  name,
  placeholder = "Enter the vehicle color",
  onSelect,
}: Props) {
  const { t } = useTranslation("components");
  const { swap } = useDirection();
  const [searchValue, setSearchValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputWidth, setInputWidth] = useState<number | undefined>();
  const inputRef = useRef<View>(null);
  const {vehicle_colors} = useStore()
  
  const labels = useMemo(() => {
    return colors.reduce<Record<string, string>>((acc, c) => {
      acc[c.value] = t(`profile.colors.${c.label.toLowerCase()}`);
      return acc;
    }, {});
  }, [t]);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
    setSelectedValue("");
    setOpen(true);
  };

  const getColorName = (hexCode:string) => {
    if (!hexCode || typeof hexCode !== 'string') return 'Unknown';
    
    try {
      const result = namer(hexCode);
      return result.ntc[0].name; // or use result.html[0].name
    } catch (error) {
      console.warn('Invalid color code:', hexCode);
      return 'Invalid Color';
    }
  };

  const filtered = useMemo(() => {
    const transformedColors = vehicle_colors.map((c) => {
      const colorName = getColorName(c.value);
  
      return {
        label: colorName,
        value: c.value,
        name: colorName.toLowerCase(), // from color code like "#FF5733" → "Red Orange"
      };
    });
  
    return transformedColors.filter((c) =>
      c.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.value.includes(searchValue.toLowerCase()) ||
      c.name.includes(searchValue.toLowerCase())
    );
  }, [colors, searchValue, t]);

  const selectItem = (value: string) => {
    setSelectedValue(value);
    setSearchValue(labels[value] || "");
    setOpen(false);
    onSelect?.(value);
  };

  const onInputBlur = () => {
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
          onFocus={() => setOpen(true)}
          onBlur={onInputBlur}
          className={cn(
            "text-lg font-Kanit-Light placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[50px] rounded-full px-16 flex-1"
          )}
        />
      </View>

      <ScrollView className="z-10 bg-white w-full mt-1 rounded-lg max-h-60">
        {isLoading ? (
          <View className="p-4">
            <Text fontSize={16}>{t("profile.loading")}</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((c, idx) => (
            <TouchableOpacity
              key={c.value}
              activeOpacity={0.8}
              onPress={() => selectItem(c.value)}
              className={cn(
                "flex-row items-center justify-between px-4 py-4",
                idx + 1 < filtered.length && "border-b border-[#EBEBEB]",
                selectedValue === c.value && "bg-[#F1F5FF]"
              )}
            >
              <View className="flex-row items-center gap-2">
                <View
                  className="w-5 h-5 rounded-[5px]"
                  style={{ backgroundColor: c.value }}
                />
                <View className="flex-1">
                  <Text fontSize={14} className="text-sm">
                    {c.label}
                  </Text>
                </View>
              </View>
              {swap(
                <ChevronRight size={20} color="#AAAAAA" />,
                <ChevronLeft size={20} color="#AAAAAA" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="px-6 py-4">
            <Text fontSize={14} className="text-sm text-gray-500">
              {t("profile.noItems")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
