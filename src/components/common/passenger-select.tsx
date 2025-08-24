import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import UserIcon from "../icons/user-icon";
import Text from "../common/text";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

type Props = {
  initialCount?: string;
  onCountChange?: (value: string) => void;
};

export default function PassengerSelect({
  initialCount = "1",
  onCountChange,
}: Props) {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);
  const [passengerCount, setPassengerCount] = useState<string>(initialCount);
  const translateY = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleSelect = (value: string) => {
    setPassengerCount(value);
    onCountChange?.(value);
    closeSheet();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openSheet}
        className="flex-row items-center justify-between bg-[#F1F1F5] rounded-full p-[8px_10px_8px_24px]"
        activeOpacity={0.8}
      >
        <Text
          fontSize={18}
          className="text-[18px] text-[#282525] font-[Kanit-Regular]"
        >
          {t("Passenger")}
        </Text>
        <View className="flex flex-row items-center justify-center gap-[2px] px-[24px] py-[8px] bg-white rounded-full min-w-[115px]">
          <UserIcon size={20} color="#424242" />
          <Text
            fontSize={20}
            className="text-[24px] text-black font-[Kanit-Regular]"
          >
            {passengerCount}
          </Text>
        </View>
      </TouchableOpacity>

      {visible && (
        <Modal transparent visible={visible} animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSheet}
            className="flex-1 bg-black/50 justify-end"
          >
            <Animated.View
              style={{ transform: [{ translateY }] }}
              className="bg-white rounded-t-3xl p-6 pb-20"
              pointerEvents="box-none"
            >
              <Text fontSize={18} className="text-lg font-[Kanit-Regular] mb-4">
                {t("Select no. of passengers")}
              </Text>

              <FlatList
                data={[1, 2, 3, 4]}
                keyExtractor={(item) => String(item)}
                renderItem={({ item }) => {
                  const value = String(item);
                  const selected = value === passengerCount;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(value)}
                      className="flex-row items-center gap-3 py-3"
                    >
                      <View
                        className={cn(
                          "border border-gray-400 rounded-full size-5",
                          selected &&
                            "bg-[#FF4848] border-[#FF4848] rounded-full"
                        )}
                      />
                      <Text
                        fontSize={16}
                        className="text-base font-[Kanit-Regular]"
                      >
                        {item} {t("Passenger", { ns: "components" })}
                        {item > 1
                          ? t("Passenger(s)", { ns: "components" })
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
