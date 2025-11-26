import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
} from "react-native";
import { Check, Search } from "lucide-react-native";
import Text from "../common/text";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  handleItemSelect?: (value: any) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: {
    desc: string;
    value: T;
    label: string;
  }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
};

export function AutoComplete<T extends string>({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  placeholder = "Search...",
  handleItemSelect
}: Props<T>) {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useRef(new Animated.Value(height)).current;

  const labels = useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {} as Record<string, string>),
    [items]
  );

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Animate the sheet to sit above keyboard
        Animated.timing(translateY, {
          toValue: 0,
          duration: Platform.OS === "ios" ? 250 : 200,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [translateY]);

  const openSheet = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setKeyboardHeight(0);
    });
  };

  const reset = () => {
    onSelectedValueChange("" as T);
    onSearchValueChange("");
  };

  const handleSelect = (value: T) => {
    if (value === selectedValue) {
      reset();
    } else {
      onSelectedValueChange(value);
      onSearchValueChange(labels[value] ?? "");
    }
    closeSheet();
  };

  // Calculate max height: total height minus keyboard height minus some padding
  const maxSheetHeight = height - keyboardHeight - 40;

  return (
    <View>
      <TouchableOpacity
        className="bg-[#F1F1F5] px-[24px] py-[16px] h-[57px] rounded-full flex-row items-center gap-[16px]"
        onPress={openSheet}
        activeOpacity={0.8}
      >
        <Search size={20} color="#4E4E58" />
        <Text
          fontSize={16}
          className={cn(
            "text-[16px] font-[Kanit-Regular]",
            searchValue || labels[selectedValue]
              ? "text-black"
              : "text-[#757478]"
          )}
        >
          {searchValue ||
            labels[selectedValue] ||
            t(placeholder, { ns: "components" })}
        </Text>
      </TouchableOpacity>

      {visible && (
        <Modal visible={visible} transparent animationType="fade">
          <TouchableOpacity
            onPress={closeSheet}
            activeOpacity={1}
            className="flex-1 bg-black/50 justify-end"
          >
            <Animated.View
              style={{
                transform: [{ translateY }],
                marginBottom: keyboardHeight,
                maxHeight: maxSheetHeight,
              }}
              className="bg-white rounded-t-3xl p-6"
            >
              <View className="relative mb-4">
                <TextInput
                  allowFontScaling={false}
                  className="border border-gray-300 rounded-lg px-4 py-3 font-[Kanit-Regular] text-base lg:!text-[17px] lg:font-normal !ring-0 lg:border-0 pr-6 lg:px-0 lg:max-w-[140px] max-lg:h-[50px] lg:rounded-none w-full max-lg:mx-auto shadow-none placeholder:text-[#757478] max-lg:bg-[#F1F1F5] max-lg:border-0"
                  placeholder={t(placeholder, { ns: "components" })}
                  value={searchValue}
                  onChangeText={onSearchValueChange}
                  autoFocus
                />
              </View>

              <FlatList
                data={items}
                keyExtractor={(item, i) => i.toString()}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      handleItemSelect?.(item);
                      handleSelect(item.value);
                    }}
                    className="flex-row items-start py-3 border-b border-gray-200"
                  >
                    <Check
                      size={16}
                      color="#000"
                      style={{ opacity: selectedValue === item.value ? 1 : 0 }}
                      className="mr-2 mt-1"
                    />
                    <View>
                      <Text
                        fontSize={16}
                        className="text-base font-[Kanit-Regular]"
                      >
                        {item.label}
                      </Text>
                      <Text
                        fontSize={14}
                        className="text-sm text-[#666] font-[Kanit-Light]"
                      >
                        {item.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}