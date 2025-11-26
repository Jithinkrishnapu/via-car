import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { RideEditDetails } from "@/types/ride-types";
import { useEditRide } from "@/service/ride-booking";

export default function Time() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL } = useDirection();
  const { setRideField } = useCreateRideStore();
  const { time: defaultTime } = useLocalSearchParams<{ time?: string }>(); // "HH:mm" 24h

  /* ------------- local states ------------- */
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");

  /* ------------- initialise from params ------------- */
  useEffect(() => {
    if (!defaultTime) return;
    const [h, m] = defaultTime.split(":").map(Number); // h:0-23  m:0-59
    const p: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    setHour(h12.toString().padStart(2, "0"));
    setMinute(m.toString().padStart(2, "0"));
    setPeriod(p);
  }, [defaultTime]);

  /* ------------- input handlers ------------- */
  const onChangeHour = (text: string) => {
    if (!/^\d{0,2}$/.test(text)) return;
    setHour(text);
  };

  const onBlurHour = () => {
    let h = parseInt(hour, 10);
    if (Number.isNaN(h) || h < 1) h = 1;
    if (h > 12) h = 12;
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
    setMinute(m.toString().padStart(2, "0"));
  };

  /* ------------- continue ------------- */
  const handleContinue = () => {
    onBlurHour();
    onBlurMinute();

    let h24 = parseInt(hour, 10);
    if (period === "PM" && h24 !== 12) h24 += 12;
    if (period === "AM" && h24 === 12) h24 = 0;

    const time24 = `${h24.toString().padStart(2, "0")}:${minute}`;
    setRideField("time", time24);
    handleEditDate(time24);
  };

  const handleEditDate = async (time: string) => {
    const req = { time } as RideEditDetails;
    const res = await useEditRide(req);
    if (res.ok) router.replace("..");
  };

  if (!loaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white font-[Kanit-Regular]"
    >
      <View className="flex-1 px-6 pt-16 pb-12">
        {/* Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} color="#000" />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] leading-tight flex-1"
          >
            {t("time.title")}
          </Text>
        </View>

        {/* Time Inputs */}
        <View className="flex-row items-center justify-center gap-2 mt-10">
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
          <Text fontSize={59} className="text-[59px] text-[#3C3F4E]">
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
                  onPress={() => setPeriod(p)}
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

      {/* Continue Button */}
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text fontSize={20} className="text-xl text-white font-[Kanit-Regular]">
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}