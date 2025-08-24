import LocationSearch from "@/components/common/location-search";
import Text from "@/components/common/text";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

function Pickup() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  if (!loaded) return null;
  return (
    <ScrollView className="w-full px-6 pt-16 pb-12 bg-white">
      <Text
        fontSize={25}
        className="text-[25px] text-[#0A2033] font-[Kanit-Medium] w-full mx-auto leading-tight mb-[33px]"
      >
        {t("pickup.title")}
      </Text>
      <LocationSearch />
      <TouchableOpacity
        className="bg-[#FF4848] rounded-full w-full h-[55px] my-[33px] cursor-pointer items-center justify-center"
        onPress={() => router.push("/(publish)/pickup-selected")}
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

export default Pickup;
