import { router } from "expo-router";
import { ChevronLeft, Info, MapPin, SquareCheckBig } from "lucide-react-native";
// import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useRoute } from "@react-navigation/native";
import Avatar from "@/components/ui/avatar";

function PassengerProfile() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const route = useRoute();
  
  // Get passenger details from route params
  const passengerData = route.params as {
    userId?: string;
    name?: string;
    profileImage?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    email?: string;
    phone?: string;
    about?: string;
  } | undefined;

  // If no passenger data is provided, show default values
  const displayName = passengerData?.name || t("passengerProfile.abhimanyu");
  const displayLocation = passengerData?.pickupAddress || t("passengerProfile.alBalad");
  const displayAbout = passengerData?.about || t("passengerProfile.aboutText");
  const hasEmail = Boolean(passengerData?.email);
  const hasPhone = Boolean(passengerData?.phone);

  if (!loaded) return null;
  return (
    <ScrollView bounces={false} className="flex-1 h-full bg-white">
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
          <Avatar
            source={passengerData?.profileImage ? { uri: passengerData.profileImage } : require(`../../../public/profile-image.jpg.webp`)}
            size={80}
            initials={displayName.substring(0, 2).toUpperCase()}
          />
          <View>
            <View className="flex-row items-center justify-between gap-6">
              <Text
                fontSize={20}
                className="text-[20px] text-black font-[Kanit-Regular]"
              >
                {displayName}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-6">
              <View className="flex-row items-center gap-1">
                <MapPin width={9} height={9} strokeWidth={1} color="black" />
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Light] text-[#666666]"
                >
                  {displayLocation}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-[#F7F7F7] h-[10px] w-full"></View>
        <View className="flex-col w-full px-6">
          <View className="flex-col gap-4 mb-8"></View>
          <View className="flex-row flex-wrap items-start gap-4 mb-[40px]">
            {hasEmail && (
              <View className="flex-row items-center gap-3">
                <SquareCheckBig color="#00665A" width={16} height={16} />
                <Text
                  fontSize={12}
                  className="text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  {t("passengerProfile.confirmedMail")}
                </Text>
              </View>
            )}
            {hasPhone && (
              <View className="flex-row items-center gap-3">
                <SquareCheckBig color="#00665A" width={16} height={16} />
                <Text
                  fontSize={12}
                  className="text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  {t("passengerProfile.confirmedPhone")}
                </Text>
              </View>
            )}
            {!hasEmail && !hasPhone && (
              <Text
                fontSize={12}
                className="text-[12px] text-[#999999] font-[Kanit-Light]"
              >
                No verification information available
              </Text>
            )}
          </View>
          <Text
            fontSize={16}
            className="text-[16px] mb-3 border-b border-[#EBEBEB] pb-4"
          >
            {t("passengerProfile.about")}
          </Text>
          
          {/* Travel Route Section */}
          {(passengerData?.pickupAddress || passengerData?.dropoffAddress) && (
            <View className="mb-4">
              <Text
                fontSize={14}
                className="text-[14px] mb-2 font-[Kanit-Medium] text-[#333333]"
              >
                Travel Route
              </Text>
              <View className="bg-[#F9F9F9] rounded-xl p-3">
                {passengerData?.pickupAddress && (
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-2 h-2 bg-[#00665A] rounded-full" />
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Light] text-[#666666] flex-1"
                    >
                      From: {passengerData.pickupAddress}
                    </Text>
                  </View>
                )}
                {passengerData?.dropoffAddress && (
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 bg-[#FF4848] rounded-full" />
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Light] text-[#666666] flex-1"
                    >
                      To: {passengerData.dropoffAddress}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          <Text
            fontSize={12}
            className="bg-[#F5F5F5] rounded-2xl p-4 mt-4 text-[12px] font-[Kanit-Light] leading-tight"
          >
            {displayAbout}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default PassengerProfile;