import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Calendar from "@/components/ui/calendar-pricing";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Date() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  if (!loaded) return null;
  return (
    <View className="w-full font-[Kanit-Regular] bg-white flex-1 relative">
      <View className="w-full mx-auto pt-16 pb-4 flex-col gap-4">
        <View className="flex-row items-center gap-4 mb-6 w-full px-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] flex-1"
          >
            {t("date.title")}
          </Text>
        </View>
        <Calendar onChange={() => {}} />
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/time-return")}
          activeOpacity={0.8}
          className="bg-[#FF4848] rounded-full h-[55px] items-center justify-center"
        >
          <Text
            fontSize={19}
            className="text-[19px] text-white font-[Kanit-Light]"
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Date;
