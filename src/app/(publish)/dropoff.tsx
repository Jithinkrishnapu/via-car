import LocationSearch from "@/components/common/location-search";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";

function Dropoff() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  if (!loaded) return null;
  return (
    <ScrollView className="px-6 pt-16 pb-12 bg-white">
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
          className="text-[25px] text-black font-[Kanit-Medium] flex-1"
        >
          {t("dropoff.title")}
        </Text>
      </View>
      <LocationSearch />
      <TouchableOpacity
        className="bg-[#FF4848] rounded-full w-full h-[55px] my-[33px] cursor-pointer items-center justify-center"
        onPress={() => router.push("/(publish)/dropoff-selected")}
        activeOpacity={0.8}
      >
        <Text
          fontSize={19}
          className="text-[19px] text-white font-[Kanit-Light]"
        >
          {t("common.continue")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default Dropoff;
