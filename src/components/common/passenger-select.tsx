import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import UserIcon from "../icons/user-icon";
import Text from "../common/text";
import { useTranslation } from "react-i18next";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";

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

  const adjustPassengers = (delta: number) => {
    const currentCount = parseInt(passengerCount);
    const newCount = Math.max(1, Math.min(9, currentCount + delta));
    const newValue = String(newCount);
    setPassengerCount(newValue);
    onCountChange?.(newValue);
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

              {/* Passenger Counter */}
              <View className="flex-row items-center justify-center space-x-2 px-6 mb-8">
                <TouchableOpacity
                  onPress={() => adjustPassengers(-1)}
                  activeOpacity={0.8}
                  disabled={parseInt(passengerCount) === 1}
                  className="w-[32px] h-[32px] rounded-full items-center justify-center"
                >
                  <MinusLarge width={32} height={32} />
                </TouchableOpacity>

                <View className="flex-1 items-center py-4">
                  <Text
                    fontSize={60}
                    className="text-[60px] text-[#00665A] font-[Kanit-SemiBold]"
                  >
                    {passengerCount.padStart(2, "0")}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => adjustPassengers(1)}
                  activeOpacity={0.8}
                  disabled={parseInt(passengerCount) === 9}
                  className="w-[32px] h-[32px] rounded-full items-center justify-center"
                >
                  <PlusLarge width={32} height={32} />
                </TouchableOpacity>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={closeSheet}
                activeOpacity={0.8}
                className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
              >
                <Text
                  fontSize={20}
                  className="text-xl text-white font-[Kanit-Regular]"
                >
                  {t("common.continue")}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
