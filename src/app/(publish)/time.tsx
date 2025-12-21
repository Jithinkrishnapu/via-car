import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useDirection } from "@/hooks/useDirection";

function Time() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const { setRideField } = useCreateRideStore();
  const { isRTL, swap } = useDirection();

  if (!loaded) return null;

  const [hour, setHour] = useState("07");

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

  const [minute, setMinute] = useState("00");

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

  /* ---------- continue ---------- */
  const handleContinue = () => {
    // ensure valid values even if user never blurred
    onBlurHour();
    onBlurMinute();

    // 12-hour → 24-hour conversion
    let h24 = parseInt(hour, 10);
    if (period === "PM" && h24 !== 12) h24 += 12;
    if (period === "AM" && h24 === 12) h24 = 0;

    const time24 = `${h24.toString().padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}`;
    setRideField("time", time24);
    router.push("/(publish)/passenger-count");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-6 pb-12">
            {/* Header */}
            <View className="flex-row items-center gap-4 mb-6">
              <TouchableOpacity
                className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
              </TouchableOpacity>
              <Text fontSize={23} className="text-[23px] font-[Kanit-Medium] flex-1">
                {t("time.title")}
              </Text>
            </View>
            
            {/* Spacer to center the time inputs */}
            <View className="flex-1r">
              {/* Time Inputs */}
              <View className="flex-row items-center justify-center gap-2">
                {/* Hour */}
                <View className="bg-[#F5F5F5] w-[100px] h-[84px] rounded-lg items-center justify-center">
                  <TextInput
                    value={hour}
                    onChangeText={onChangeHour}
                    onBlur={onBlurHour}
                    keyboardType="number-pad"
                    maxLength={2}
                    className="text-[59px] font-[Kanit-Regular] text-[#3C3F4E] text-center w-full h-full"
                    style={{
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                      lineHeight: Platform.OS === 'ios' ? 84 : 59,
                    }}
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
                    className="text-[59px] font-[Kanit-Regular] text-[#3C3F4E] text-center w-full h-full"
                    style={{
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                      lineHeight: Platform.OS === 'ios' ? 84 : 59,
                    }}
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
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleContinue}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Time;