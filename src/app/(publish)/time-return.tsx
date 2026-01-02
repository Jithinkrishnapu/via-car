import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";

function Time() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const { ride, setRideField } = useCreateRideStore();
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [isToday, setIsToday] = useState(false);

  // Check if selected date is today
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // yyyy-MM-dd format
    setIsToday(ride.date === todayString);
  }, [ride.date]);

  // Set minimum time if today is selected
  useEffect(() => {
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Add 1 hour buffer for upcoming times
      const minHour = currentHour + 1;
      const minMinute = currentMinute;
      
      if (minHour >= 24) {
        // If adding 1 hour goes to next day, set to next available day
        return;
      }
      
      const minPeriod: "AM" | "PM" = minHour >= 12 ? "PM" : "AM";
      const min12Hour = minHour === 0 ? 12 : minHour > 12 ? minHour - 12 : minHour;
      
      setHour(min12Hour.toString().padStart(2, "0"));
      setMinute(minMinute.toString().padStart(2, "0"));
      setPeriod(minPeriod);
    }
  }, [isToday]);

  if (!loaded) return null;

  const onChangeHour = (text: string) => {
    if (!/^\d{0,2}$/.test(text)) return;
    setHour(text);
  };

  const onBlurHour = () => {
    let h = parseInt(hour, 10);
    if (Number.isNaN(h) || h < 1) h = 1;
    if (h > 12) h = 12;
    
    // If today, check minimum time
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours() + 1; // 1 hour buffer
      const currentMinute = now.getMinutes();
      
      let h24 = h;
      if (period === "PM" && h !== 12) h24 += 12;
      if (period === "AM" && h === 12) h24 = 0;
      
      const selectedTime = h24 * 60 + parseInt(minute, 10);
      const minTime = currentHour * 60 + currentMinute;
      
      if (selectedTime < minTime) {
        const minPeriod: "AM" | "PM" = currentHour >= 12 ? "PM" : "AM";
        const min12Hour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
        h = min12Hour;
        setPeriod(minPeriod);
        setMinute(currentMinute.toString().padStart(2, "0"));
      }
    }
    
    setHour(h.toString().padStart(2, "0"));
  };

  const onChangeMinute = (text: string) => {
    if (!/^\d{0,2}$/.test(text)) return;
    setMinute(text);
  };

  const onBlurMinute = () => {
    let m = parseInt(minute, 10);
    if (Number.isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    
    // If today, check minimum time
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours() + 1; // 1 hour buffer
      const currentMinute = now.getMinutes();
      
      let h24 = parseInt(hour, 10);
      if (period === "PM" && h24 !== 12) h24 += 12;
      if (period === "AM" && h24 === 12) h24 = 0;
      
      const selectedTime = h24 * 60 + m;
      const minTime = currentHour * 60 + currentMinute;
      
      if (selectedTime < minTime) {
        m = currentMinute;
      }
    }
    
    setMinute(m.toString().padStart(2, "0"));
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    
    // If today, validate the new time
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours() + 1; // 1 hour buffer
      const currentMinute = now.getMinutes();
      
      let h24 = parseInt(hour, 10);
      if (newPeriod === "PM" && h24 !== 12) h24 += 12;
      if (newPeriod === "AM" && h24 === 12) h24 = 0;
      
      const selectedTime = h24 * 60 + parseInt(minute, 10);
      const minTime = currentHour * 60 + currentMinute;
      
      if (selectedTime < minTime) {
        const minPeriod: "AM" | "PM" = currentHour >= 12 ? "PM" : "AM";
        const min12Hour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
        setHour(min12Hour.toString().padStart(2, "0"));
        setMinute(currentMinute.toString().padStart(2, "0"));
        setPeriod(minPeriod);
      }
    }
  };

  /* ---------- 24-hour conversion ---------- */
  const handleContinue = () => {
    onBlurHour();
    onBlurMinute();

    let h24 = parseInt(hour, 10);
    if (period === "PM" && h24 !== 12) h24 += 12;
    if (period === "AM" && h24 === 12) h24 = 0;

    const time24 = `${h24.toString().padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}`;
    setRideField("time", time24);
    router.push("/(publish)/passenger-count-return");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <View className="flex-1 px-6 pt-6">
          {/* Back + Title */}
          <View className="flex-row items-center gap-4 mb-6">
            <TouchableOpacity
              className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
              onPress={() => router.replace("..")}
              activeOpacity={0.8}
            >
              {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
            </TouchableOpacity>
            <Text
              fontSize={25}
              className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
            >
              {t("time.title")}
            </Text>
          </View>

          {/* Time Inputs */}
          <View className="flex-1 justify-start">
            <View className="flex-row items-center justify-center gap-2">
              {/* Hour */}
              <View className="bg-[#F5F5F5] w-[100px] h-[84px] rounded-lg items-center justify-center">
                <TextInput
                  value={hour}
                  onChangeText={onChangeHour}
                  onBlur={onBlurHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="text-[59px] font-[Kanit-Regular] text-[#3C3F4E] text-center leading-[59px]"
                />
              </View>

              {/* Colon */}
              <Text
                fontSize={59}
                className="text-[59px] font-[Kanit-Regular] text-[#3C3F4E]"
              >
                :
              </Text>

              {/* Minute */}
              <View className="bg-[#F5F5F5] w-[100px] h-[84px] rounded-lg items-center justify-center">
                <TextInput
                  value={minute}
                  onChangeText={onChangeMinute}
                  onBlur={onBlurMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="text-[59px] font-[Kanit-Regular] text-[#3C3F4E] text-center leading-[59px]"
                />
              </View>

              {/* AM/PM Toggle */}
              <View className="ml-2 h-[84px] w-[55px] rounded-lg overflow-hidden border border-[#00665A]">
                {(["AM", "PM"] as const).map((p, i) => {
                  const isSel = period === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => handlePeriodChange(p)}
                      activeOpacity={0.8}
                      className={`flex-1 items-center justify-center ${
                        isSel ? "bg-[#00665A]" : "bg-white"
                      }`}
                      style={
                        i === 0
                          ? { borderBottomWidth: 1, borderBottomColor: "#00665A" }
                          : {}
                      }
                    >
                      <Text
                        fontSize={15}
                        className={`text-[15px] font-[Kanit-Medium] ${
                          isSel ? "text-white" : "text-[#5F6368]"
                        }`}
                      >
                        {p === "AM" ? t("time.am") : t("time.pm")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Continue Button - stays above keyboard */}
        <View className="px-6 pb-8 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center mt-4"
          >
            <Text
              fontSize={20}
              className="text-xl text-white font-[Kanit-Regular]"
            >
              {t("common.continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Time;