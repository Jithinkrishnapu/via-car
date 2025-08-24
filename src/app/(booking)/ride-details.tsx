import { Separator } from "@/components/ui/separator";
import { Link, router } from "expo-router";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Avatar from "@/components/ui/avatar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from "react-native";
import Text from "@/components/common/text";
import Verified from "../../../public/verified.svg";
import Chat from "../../../public/chat.svg";
import Direction from "../../../public/direction4.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function RideDetails() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();

  if (!loaded) return null;
  return (
    <ScrollView>
      <View className="bg-[#F5F5F5] font-[Kanit-Regular]">
        <ImageBackground
          source={require("../../../public/hero.png")}
          className="flex-col h-[260px]"
        >
          <View className="z-10 w-full h-max mx-auto px-6 pt-[60px] flex-col">
            <View className="flex-row items-center gap-6 mb-8">
              <TouchableOpacity
                className="bg-white/20 rounded-full size-[45px] border-0 flex items-center justify-center"
                activeOpacity={0.8}
                onPress={() => router.replace("..")}
              >
                {swap(
                  <ChevronLeft color="#ffffff" />,
                  <ChevronRight color="#ffffff" />
                )}
              </TouchableOpacity>
              <Text
                fontSize={22}
                className="text-[22px] text-white font-[Kanit-Medium]"
              >
                {t("rideDetails.rideDetails")}
              </Text>
            </View>
            <View className="flex-row items-center gap-4 mb-5">
              <Direction />
              <View className="flex flex-col">
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("rideDetails.pickup")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base lg:text-lg text-white mb-4 font-[Kanit-Regular]"
                >
                  {t("rideDetails.alKhobar")}
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("rideDetails.drop")}
                  Drop
                </Text>
                <Text
                  fontSize={16}
                  className="text-base lg:text-lg text-white font-[Kanit-Regular]"
                >
                  {t("rideDetails.riyadh")}
                </Text>
              </View>
              <View
                className={swap(
                  "flex flex-col text-end ml-auto",
                  "flex flex-col text-start mr-auto"
                )}
              >
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("rideDetails.pickupTime")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base lg:text-lg text-white mb-4 font-[Kanit-Regular]"
                >
                  13:00
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("rideDetails.dropTime")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base lg:text-lg text-white font-[Kanit-Regular]"
                >
                  17:40
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View className="max-w-[1410px] w-full mx-auto">
          <View className="flex-col gap-2">
            <View className="px-8 py-6 rounded-none border-none bg-white">
              <View className="flex-row items-center justify-between">
                <View className="flex flex-col">
                  <Text
                    fontSize={17}
                    className="text-[17px] text-black font-[Kanit-Regular] mb-1"
                  >
                    {t("rideDetails.carType")}
                  </Text>
                  <Text
                    fontSize={10}
                    className="text-[10px] text-[#666666] font-[Kanit-Light]"
                  >
                    {t("rideDetails.sedan")}
                  </Text>
                </View>
                <View className="w-[68px] h-[25px]">
                  <Image
                    className="w-full h-full"
                    resizeMode="contain"
                    source={require(`../../../public/car-preview.png`)}
                    alt=""
                  />
                </View>
              </View>
            </View>
            <View className="px-8 py-6 rounded-none bg-white">
              <View className="flex-row items-center justify-between">
                <Link href={`/profile`} className="flex-row items-start">
                  <View className="w-[40px]">
                    <Avatar
                      source={require(`../../../public/profile-img.png`)}
                      size={40}
                      initials="CN"
                    />
                  </View>
                  <View className={swap("flex-col ml-4", "flex-col mr-4")}>
                    <View className="flex-row items-center gap-2">
                      <Text
                        fontSize={14}
                        className="text-[14px] mb-1 font-[Kanit-Regular]"
                      >
                        {t("rideDetails.abhimanyu")}
                      </Text>
                      <Verified width={15} height={15} />
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Star strokeWidth={0} fill="#FF9C00" size={14} />
                      <Text
                        fontSize={14}
                        className="text-[14px] font-[Kanit-Regular]"
                      >
                        4.5
                      </Text>
                      <Text
                        fontSize={10}
                        className="text-[10px] text-[#939393] font-[Kanit-Light]"
                      >
                        {t("rideDetails.ratings")}
                      </Text>
                    </View>
                  </View>
                </Link>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    className="rounded-full size-[38px] border border-[#EBEBEB] flex-row items-center justify-center"
                    activeOpacity={0.8}
                    onPress={() => router.push("/(booking)/chat")}
                  >
                    <Chat width={15} height={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className="px-8 py-4 rounded-none bg-white">
              <View className="flex flex-col">
                <Text
                  fontSize={17}
                  className="text-[17px] mb-[11px] font-[Kanit-Regular]"
                >
                  {t("rideDetails.details")}
                </Text>
                <View className="flex-row flex-wrap gap-2 pb-1">
                  <Text
                    fontSize={13}
                    className="flex-row items-center justify-center rounded-full border border-[#E1DFDF] px-[14px] py-[4px] h-max text-[13px] font-[Kanit-Light] w-max"
                  >
                    {t("rideDetails.rarelyCancelsRides")}
                  </Text>
                  <Text
                    fontSize={13}
                    className="flex-row items-center justify-center rounded-full border border-[#E1DFDF] px-[14px] py-[4px] h-max text-[13px] font-[Kanit-Light] w-max"
                  >
                    {t("rideDetails.instantBooking")}
                  </Text>
                  <Text
                    fontSize={13}
                    className="flex-row items-center justify-center rounded-full border border-[#E1DFDF] px-[14px] py-[4px] h-max text-[13px] font-[Kanit-Light] w-max"
                  >
                    {t("rideDetails.fineWithSmoking")}
                  </Text>
                  <Text
                    fontSize={13}
                    className="flex-row items-center justify-center rounded-full border border-[#E1DFDF] px-[14px] py-[4px] h-max text-[13px] font-[Kanit-Light] w-max"
                  >
                    {t("rideDetails.fineWithSmoking")}
                  </Text>
                </View>
              </View>
            </View>
            <View className="px-8 py-4 gap-4 rounded-none bg-white">
              <Text fontSize={17} className="text-[17px] font-[Kanit-Regular]">
                {t("rideDetails.passengers")}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-between"
                onPress={() => router.push("/passenger-profile")}
              >
                <View className="flex-row items-center gap-4">
                  <Avatar
                    source={require(`../../../public/profile-img.png`)}
                    size={40}
                    initials="CN"
                  />
                  <View className="flex flex-col">
                    <Text
                      fontSize={14}
                      className="text-[14px] mb-1 font-[Kanit-Regular]"
                    >
                      {t("rideDetails.karthik")}
                    </Text>
                    <View className="flex-row items-center justify-between gap-1">
                      <Text
                        fontSize={12}
                        className="text-[12px] text-[#666666] font-[Kanit-Light]"
                      >
                        {t("rideDetails.chennai")}
                      </Text>
                      {swap(
                        <ArrowRight size={10} color="#A5A5A5" />,
                        <ArrowLeft size={10} color="#A5A5A5" />
                      )}
                      <Text
                        fontSize={12}
                        className="text-[12px] text-[#666666] font-[Kanit-Light]"
                      >
                        {t("rideDetails.banglaluru")}
                      </Text>
                    </View>
                  </View>
                </View>
                <View>
                  {swap(
                    <ChevronRight color="#A69A9A" className="size-[24px]" />,
                    <ChevronLeft color="#A69A9A" className="size-[24px]" />
                  )}
                </View>
              </TouchableOpacity>
              <Separator className="my-1 border-t !border-dashed !border-[#CDCDCD] bg-transparent" />
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center justify-between"
                onPress={() => router.push("/passenger-profile")}
              >
                <View className="flex-row items-center gap-4">
                  <Avatar
                    source={require(`../../../public/profile-img.png`)}
                    size={40}
                    initials="CN"
                  />
                  <View className="flex flex-col">
                    <Text
                      fontSize={14}
                      className="text-[14px] mb-1 font-[Kanit-Regular]"
                    >
                      {t("rideDetails.karthik")}
                    </Text>
                    <View className="flex-row items-center justify-between gap-1">
                      <Text
                        fontSize={12}
                        className="text-[12px] text-[#666666] font-[Kanit-Light]"
                      >
                        {t("rideDetails.chennai")}
                      </Text>
                      {swap(
                        <ArrowRight size={10} color="#A5A5A5" />,
                        <ArrowLeft size={10} color="#A5A5A5" />
                      )}
                      <Text
                        fontSize={12}
                        className="text-[12px] text-[#666666] font-[Kanit-Light]"
                      >
                        {t("rideDetails.banglaluru")}
                      </Text>
                    </View>
                  </View>
                </View>
                <View>
                  {swap(
                    <ChevronRight color="#A69A9A" className="size-[24px]" />,
                    <ChevronLeft color="#A69A9A" className="size-[24px]" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <View className="px-8 py-4 gap-4 rounded-none bg-white">
              <Text fontSize={17} className="text-[17px] font-[Kanit-Regular]">
                {t("rideDetails.priceSummary")}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text fontSize={15} className="text-[15px] font-[Kanit-Light]">
                  {t("rideDetails.onePassenger")}
                </Text>
                <Text
                  fontSize={15}
                  className="text-[15px] font-[Kanit-Regular]"
                >
                  <Text fontSize={15} className="font-[Kanit-Regular]">
                    SR
                  </Text>
                  <Text fontSize={15} className="ml-2 font-[Kanit-Regular]">
                    {" "}
                    460.00
                  </Text>
                </Text>
              </View>
              <Separator className="mt-2 border-t !border-dashed !border-[#CDCDCD] bg-transparent" />
              <View className="flex-row gap-2 items-center">
                <Text
                  fontSize={12}
                  className="flex-1 text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  {t("rideDetails.amountPaidToDriver")}
                </Text>
                <Text
                  fontSize={15}
                  className="w-[10px] text-[15px] font-[Kanit-Regular]"
                >
                  :
                </Text>
                <Text
                  fontSize={12}
                  className="text-[12px] text-end font-[Kanit-Regular]"
                >
                  SR 460.00
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text
                  fontSize={12}
                  className="flex-1 text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  {t("rideDetails.serviceFeeAndVAT")}
                </Text>
                <Text
                  fontSize={15}
                  className="w-[10px] text-[15px] font-[Kanit-Regular]"
                >
                  :
                </Text>
                <Text
                  fontSize={12}
                  className="text-[12px] text-end font-[Kanit-Regular]"
                >
                  SR 100.00
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text
                  fontSize={16}
                  className="flex-1 text-base font-[Kanit-Regular]"
                >
                  {t("rideDetails.totalPrice")}
                </Text>
                <Text
                  fontSize={15}
                  className="w-[10px] text-[15px] font-[Kanit-Regular]"
                >
                  :
                </Text>
                <Text
                  fontSize={17}
                  className="text-[17px] text-[#00665A] font-[Kanit-Medium] text-end"
                >
                  SR 560.00
                </Text>
              </View>
              <View className="flex-row items-center justify-center py-4">
                <TouchableOpacity
                  className="bg-[#FF4848] rounded-full h-[55px] w-full px-8 cursor-pointer flex items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => router.push("/(booking)/payment")}
                >
                  <Text
                    fontSize={19}
                    className="text-[19px] text-white font-[Kanit-Regular]"
                  >
                    {t("rideDetails.manageRide")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default RideDetails;
