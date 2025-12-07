import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Calendar from "@/components/ui/calendar-pricing";
import { TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";

function Date() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const {setRideField} = useCreateRideStore()
  if (!loaded) return null;
  return (
    <View className="w-full font-[Kanit-Regular] bg-white flex-1 relative">
      <View className="w-full mx-auto pt-16 pb-4 flex-col gap-4">
        <Calendar onChange={(date) => {setRideField("date",date)}} />
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.push("/(publish)/time")}
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
