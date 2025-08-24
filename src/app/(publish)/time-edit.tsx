import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Time() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [hour, setHour] = useState("7");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  if (!loaded) return null;

  const onChangeHour = (text: string) => {
    const num = parseInt(text, 10);
    if (
      /^\d{0,2}$/.test(text) &&
      (!isNaN(num) ? num >= 1 && num <= 12 : text === "")
    ) {
      setHour(text);
    }
  };

  const onChangeMinute = (text: string) => {
    const num = parseInt(text, 10);
    if (
      /^\d{0,2}$/.test(text) &&
      (!isNaN(num) ? num >= 0 && num <= 59 : text === "")
    ) {
      setMinute(text.padStart(2, "0"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white font-[Kanit-Regular]"
    >
      <View className="flex-1 px-6 pt-16 pb-12">
        {/* Back + Title */}
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
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
              allowFontScaling={false}
              value={hour}
              onChangeText={onChangeHour}
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
              allowFontScaling={false}
              value={minute}
              onChangeText={onChangeMinute}
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
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default Time;
