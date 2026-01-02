import { useState, useMemo, useRef } from "react";
import { locations } from "@/constants/locations";
import { ChevronRight, ChevronLeft, Search } from "lucide-react-native";
import {
  ScrollView,
  TextInput,
  Pressable,
  View,
  LayoutChangeEvent,
} from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

interface Props {
  label?: string;
  name: string;
  onSelect?: (city: string) => void;
}

export default function CitySearch({ label, name, onSelect }: Props) {
  const { t } = useTranslation("components");
  const { swap } = useDirection();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [inputWidth, setInputWidth] = useState<number | undefined>();
  const inputRef = useRef<View>(null);

  const labels = useMemo(() => {
    return locations.reduce<Record<string, string>>((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {});
  }, []);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
    setOpen(true);
  };

  const filteredLocations = locations.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  const onSelectItem = (value: string) => {
    const labelText = labels[value] || value;
    setSearchValue(labelText);
    setOpen(false);
    onSelect?.(value);
  };

  const onInputBlur = () => {
    // small delay so onPress can fire
    setTimeout(() => setOpen(false), 150);
  };

  const measureInput = (e: LayoutChangeEvent) => {
    setInputWidth(e.nativeEvent.layout.width);
  };

  return (
    <View className="relative w-full">
      {label && (
        <Text
          fontSize={17}
          className="text-[17px] text-[#939393] font-[Kanit-Light] mb-2"
        >
          {t(label)}
        </Text>
      )}
      <View
        ref={inputRef}
        onLayout={measureInput}
        className="w-full mb-4 relative"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2"
          size={20}
          color="#000"
        />
        <TextInput
          allowFontScaling={false}
          value={searchValue}
          onChangeText={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={onInputBlur}
          placeholder={t("Enter the full address", { ns: "components" })}
          autoComplete="off"
          className="text-lg font-[Kanit-Light] placeholder:text-[#666666] bg-white h-[60px] rounded-full pl-14 pr-4 border border-gray-200"
        />
      </View>

      {open && (
        <View
          className="absolute bg-white rounded-lg shadow-md max-h-[300px] z-10"
          style={{ width: inputWidth }}
        >
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((option, idx) => (
                <Pressable
                  key={option.value}
                  onPress={() => onSelectItem(option.value)}
                  className="px-4 py-3 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text fontSize={14} className="text-sm">
                      {option.label}
                    </Text>
                    <Text
                      fontSize={16}
                      className="text-xs font-[Kanit-Light] text-[#666666]"
                    >
                      {option.desc}
                    </Text>
                  </View>
                  {swap(
                    <ChevronRight size={20} color="#AAAAAA" />,
                    <ChevronLeft size={20} color="#AAAAAA" />
                  )}
                </Pressable>
              ))
            ) : (
              <View className="px-4 py-3">
                <Text fontSize={14} className="text-sm text-gray-500">
                  {t("No items.", { ns: "components" })}
                </Text>
              </View>
            )}
          </ScrollView>
          {/* separators */}
          {filteredLocations.map((_, i) =>
            i < filteredLocations.length - 1 ? (
              <View
                key={`sep-${i}`}
                className="border-t border-dashed border-[#CDCDCD]"
              />
            ) : null
          )}
        </View>
      )}
    </View>
  );
}
