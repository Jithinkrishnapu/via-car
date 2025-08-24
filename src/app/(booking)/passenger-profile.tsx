import { router } from "expo-router";
import { ChevronLeft, Info, MapPin, SquareCheckBig } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";

function PassengerProfile() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  if (!loaded) return null;
  return (
    <ScrollView className="flex-1 h-full bg-white">
      <View className="font-[Kanit-Regular] w-full pt-16 pb-12 flex-col items-start gap-2">
        <View className="flex-row items-center gap-4 mb-6 w-full px-6">
          <TouchableOpacity
            className="bg-white/20 border border-[#EBEBEB] rounded-full size-[45px] items-center justify-center"
            activeOpacity={0.8}
            onPress={() => router.replace("..")}
          >
            <ChevronLeft color="#3C3F4E" />
          </TouchableOpacity>
          <Text
            fontSize={22}
            className="text-[22px] text-black font-[Kanit-Medium]"
          >
            {t("passengerProfile.profile")}
          </Text>
          <TouchableOpacity
            className="border border-[#EBEBEB] rounded-full h-max px-[14px] py-[7px] ml-auto flex-row items-center justify-center gap-[7px]"
            activeOpacity={0.8}
          >
            <Info
              width={14}
              height={14}
              color="#FF4848"
              className="size-[14px]"
            />
            <Text
              fontSize={10}
              className="text-[10px] font-[Kanit-Light] text-[#FF4848]"
            >
              {t("passengerProfile.reportNumber")}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-[20px] w-full px-6 pb-8">
          <Image
            className="size-[80px]"
            source={require(`../../../public/profile-img.png`)}
            alt=""
          />
          <View>
            <View className="flex-row items-center justify-between gap-6">
              <Text
                fontSize={20}
                className="text-[20px] text-black font-[Kanit-Regular]"
              >
                {t("passengerProfile.abhimanyu")}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-6">
              <View className="flex-row items-center gap-1">
                <MapPin width={9} height={9} strokeWidth={1} color="black" />
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Light] text-[#666666]"
                >
                  {t("passengerProfile.alBalad")}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-[#F7F7F7] h-[10px] w-full"></View>
        <View className="flex-col w-full px-6">
          <View className="flex-col gap-4 mb-8"></View>
          <View className="flex-row flex-wrap items-start gap-4 mb-[40px]">
            <View className="flex-row items-center gap-3">
              <SquareCheckBig color="#00665A" width={16} height={16} />
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                {t("passengerProfile.confirmedMail")}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <SquareCheckBig color="#00665A" width={16} height={16} />
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                {t("passengerProfile.confirmedPhone")}
              </Text>
            </View>
          </View>
          <Text
            fontSize={16}
            className="text-[16px] mb-3 border-b border-[#EBEBEB] pb-4"
          >
            {t("passengerProfile.about")}
          </Text>
          <Text
            fontSize={12}
            className="bg-[#F5F5F5] rounded-2xl p-4 mt-4 text-[12px] font-[Kanit-Light] leading-tight"
          >
            {t("passengerProfile.aboutText")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default PassengerProfile;
