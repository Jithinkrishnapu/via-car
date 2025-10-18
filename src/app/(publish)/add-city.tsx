import LocationSearch from "@/components/common/location-search";
import Text from "@/components/common/text";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function Page() {
  const loaded = useLoadFonts();
  if (!loaded) return null;
  const route = useRoute()
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
            Add a new city to the list
          </Text>
        </View>
        <LocationSearch onSelect={(value) => {
          let locations = route?.params?.place && JSON?.parse(route?.params?.place) || []
          console.log(locations)
          locations.push(value)
          router.replace({ pathname: "/(publish)/stopovers", params: { location: JSON.stringify(locations) } });
        }} />
      </View>
    </ScrollView>
  );
}
