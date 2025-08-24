import ChatIcon from "@/components/icons/chat-icon";
import { router } from "expo-router";
import {
  ChevronLeft,
  Info,
  MapPin,
  SquareCheckBig,
  Star,
  StarHalf,
} from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";

function ChatProfile() {
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
            {t("chatProfile.profile")}
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
              {t("chatProfile.reportNumber")}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-start gap-[20px] w-full px-6">
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
                {t("chatProfile.abhimanyu")}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-6">
              <View>
                <View className="text-[12px] text-[#666666] font-[Kanit-Light] mb-1">
                  <View className="flex-row items-center gap-1">
                    <MapPin
                      width={9}
                      height={9}
                      strokeWidth={1}
                      color="black"
                    />
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Light] text-[#666666]"
                    >
                      {t("chatProfile.alBalad")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="flex-row items-center mb-8"
                  onPress={() => router.push(`/(booking)/reviews`)}
                  activeOpacity={0.8}
                >
                  <Text
                    fontSize={16}
                    className="text-[16px] font-[Kanit-Regular] mr-2"
                  >
                    4.5
                  </Text>
                  <Star strokeWidth={0} fill="#FF9C00" width={14} height={14} />
                  <Star strokeWidth={0} fill="#FF9C00" width={14} height={14} />
                  <Star strokeWidth={0} fill="#FF9C00" width={14} height={14} />
                  <Star strokeWidth={0} fill="#FF9C00" width={14} height={14} />
                  <StarHalf
                    strokeWidth={0}
                    fill="#FF9C00"
                    width={14}
                    height={14}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="border border-[#EBEBEB] rounded-full size-[38px] cursor-pointer ml-auto items-center justify-center"
            onPress={() => router.push("/(booking)/chat")}
            activeOpacity={0.8}
          >
            <ChatIcon
              stroke="#FF4848"
              width={20}
              height={20}
              className="size-[20px]"
            />
          </TouchableOpacity>
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
                {t("chatProfile.confirmedMail")}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <SquareCheckBig color="#00665A" width={16} height={16} />
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                {t("chatProfile.confirmedPhone")}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text
                fontSize={15}
                className="text-[#00665A] text-[15px] font-[Kanit-Light]"
              >
                53
              </Text>
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                {t("chatProfile.ridePublished")}
              </Text>
            </View>
          </View>
          <Text
            fontSize={16}
            className="text-[16px] mb-3 border-b border-[#EBEBEB] pb-2"
          >
            {t("chatProfile.about")}
          </Text>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("chatProfile.phoneNumber")}
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              9484738312
            </Text>
          </View>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("chatProfile.mailId")}
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              abhimanyu123@gmail.com
            </Text>
          </View>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("chatProfile.experience")}
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              {t("chatProfile.intermediate")}
            </Text>
          </View>
          <Text
            fontSize={12}
            className="bg-[#F5F5F5] rounded-2xl p-4 text-[12px] font-[Kanit-Light] leading-tight"
          >
            {t("chatProfile.aboutText")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default ChatProfile;
