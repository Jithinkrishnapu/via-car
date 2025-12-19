import LocationSearch from "@/components/common/location-search";
import Text from "@/components/common/text";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function Page() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  if (!loaded) return null;
  return (
    <ScrollView className="bg-white">
      <View className="w-full px-6 pt-14 pb-12">
        <View className="flex-row items-center gap-4 mb-6 w-full">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text fontSize={25} className="text-[25px] text-black font-[Kanit-Medium] flex-1">
            {t("stopovers.addCity")}
          </Text>
        </View>
        <LocationSearch />
      </View>
    </ScrollView>
  );
}
