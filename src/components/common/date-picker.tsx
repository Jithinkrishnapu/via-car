import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Text from "../common/text";
import CalendarIcon from "../icons/calendar-icon";
import Calendar from "../ui/calendar-pricing";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

type Props ={
  onSelect?:(val:Date)=>void
}

export default function DatePicker({onSelect}:Props) {
  const { t } = useTranslation("components");
  const defaultDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultDate
  );
  const [tempDate, setTempDate] = useState<Date | undefined>(defaultDate);
  const [visible, setVisible] = useState(false);
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

  const getDisplayDate = (date?: Date) => {
    if (!date) return t("datePicker.pickDate");
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString())
      return t("datePicker.today");
    if (date.toDateString() === tomorrow.toDateString())
      return t("datePicker.tomorrow");
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
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
          {t("datePicker.scheduleTrip")}
        </Text>
        <View className="flex flex-row items-center justify-center gap-[2px] px-[24px] py-[8px] bg-white rounded-full min-w-[115px]">
          <CalendarIcon size={20} color="#424242" />
          <Text
            fontSize={16}
            className="text-[16px] text-black font-[Kanit-Regular]"
          >
            {getDisplayDate(selectedDate)}
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
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <Calendar
                  onChange={(newDate) => {
                    onSelect(new Date(newDate))
                    setTempDate(new Date(newDate))}}
                />
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(tempDate);
                    closeSheet();
                  }}
                  className="bg-[#FF4848] w-36 h-12 rounded-full justify-center items-center mt-6 mx-auto"
                  activeOpacity={0.8}
                >
                  <Text
                    fontSize={16}
                    className="text-white text-base font-[Kanit-Regular]"
                  >
                    {t("datePicker.apply")}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
