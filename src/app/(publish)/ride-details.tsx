import { Separator } from "@/components/ui/separator";
import { Link, router } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
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
  FlatList,
} from "react-native";
import Text from "@/components/common/text";
import Verified from "../../../public/verified.svg";
import Chat from "../../../public/chat.svg";
import Direction from "../../../public/direction4.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useGetPublishedRideDetails, useGetRideDetails } from "@/service/ride-booking";
import { useCallback, useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { RideDetail } from "@/types/ride-types";
import { useGetProfileDetails } from "@/service/auth";
import MusicIcon from "../../../public/music.svg";
import SmokingIcon from "../../../public/cigarette-light.svg";
import PetsIcon from "../../../public/paw.svg";

function RideDetails() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [rideDetail, setRideDetail] = useState<RideDetail>()

  console.log("ridedetail===========",rideDetail)

  const [userDetails, setUserDetails] = useState(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await useGetProfileDetails();
      if (res?.data) setUserDetails(res.data);
    } catch {
      /* optional toast / log */
    }
  }, []);

  /* first load */
  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  if (!loaded) return null;

  const route = useRoute();
  const routeParams = route?.params as { ride_id?: string; passengers?: string } | undefined;
  const passengerCount = routeParams?.passengers ? Number(routeParams.passengers) : 1;

  console.log("ride---------------", route)

  const handleGetRideDetails = async () => {
    const postData = {
      ride_id: routeParams?.ride_id ? Number(routeParams.ride_id) : 0
    }
    console.log("postData========", postData)
    const response = await useGetPublishedRideDetails(postData)
    if (response?.data) {
      // handleRoutes(response?.data)
      setRideDetail(response.data)
      // setPolyline(response?.data?.rideId?.ride_route)
    }
    console.log("responde===========", JSON.stringify(response))
  }

  useEffect(() => {
    handleGetRideDetails()
  }, [])

  return (
    <ScrollView bounces={false}>
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
                  {rideDetail?.pickUpStop?.address}
                </Text>
                <Text
                  fontSize={14}
                  className="text-sm lg:text-base text-[#DEDEDE] font-[Kanit-Light]"
                >
                  {t("rideDetails.drop")}
                </Text>
                <Text
                  fontSize={16}
                  className="text-base lg:text-lg text-white font-[Kanit-Regular]"
                >
                  {rideDetail?.dropOffStop?.address}
                </Text>
              </View>
              {/* <View
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
              </View> */}
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
                    {rideDetail?.vehicle?.vehicleModel?.category_name}
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
            {/* <View className="px-8 py-6 rounded-none bg-white">
              <View className="flex-row items-center justify-between">
                <Link href={`/profile`} className="flex-row items-start gap-4">
                  <View className="w-[60px]">
                    <Avatar
                      source={require(`../../../public/profile-img.png`)}
                      size={40}
                      initials="CN"
                    />
                  </View>
                  <View className="flex-col">
                    <View className="flex-row items-center gap-2">
                      <Text
                        fontSize={14}
                        className="text-[14px] mb-1 font-[Kanit-Regular]"
                      >
                        {rideDetail?.driver?.first_name}
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
                    onPress={() => router.push({ pathname: "/(inbox)/chat", params: { driver_id: rideDetail?.driver?.id, driver_name: rideDetail?.driver?.first_name } })}
                  >
                    <Chat width={15} height={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View> */}
            <View className="px-8 py-4 rounded-none bg-white">
              <View className="flex flex-col">
                <Text
                  fontSize={17}
                  className="text-[17px] mb-[11px] font-[Kanit-Regular]"
                >
                  {t("rideDetails.details")}
                </Text>
                <View className="flex-wrap flex-row gap-[15px]">
                {(() => {
                  const prefs = userDetails?.travel_preferences;
                  let travelPreferences: string[] = [];
                  if (!prefs) travelPreferences = [];
                  else if (Array.isArray(prefs) && prefs.every(p => typeof p === 'string')) {
                    travelPreferences = prefs.filter(p => p.trim().length > 0);
                  }
                  return travelPreferences.map((text: string) => {
                    let Icon = Chat;
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes("music")) Icon = MusicIcon;
                    else if (lowerText.includes("smoke") || lowerText.includes("smoking")) Icon = SmokingIcon;
                    else if (lowerText.includes("pet")) Icon = PetsIcon;

                    return (
                    <View
                      key={text}
                      className="border border-gray-200 rounded-full flex-row items-center px-4 py-2"
                    >
                      <Icon width={21} height={21} />
                      <Text className="ml-2 text-sm font-[Kanit-Light]">{text}</Text>
                    </View>
                  )});
                })()}
              </View>
              </View>
            </View>
            <View className="px-8 py-4 gap-4 rounded-none bg-white">
              <Text fontSize={17} className="text-[17px] font-[Kanit-Regular]">
                {t("rideDetails.passengers")}
              </Text>
              <FlatList
                data={rideDetail?.passengers}
                renderItem={({ item }) => {
                  return <TouchableOpacity
                    activeOpacity={0.8}
                    className="flex-row items-center justify-between"
                    onPress={() => router.push({
                      pathname: "/(publish)/passenger-profile",
                      params: {
                        userId: item?.user?.id?.toString() || "",
                        name: item?.user?.name || "Unknown Passenger",
                        profileImage: item?.user?.profile_image || "",
                        pickupAddress: rideDetail?.pickUpStop?.address || "",
                        dropoffAddress: rideDetail?.dropOffStop?.address || "",
                        email: (item?.user as any)?.email || "",
                        phone: (item?.user as any)?.phone || "",
                        about: (item?.user as any)?.about || "No additional information available."
                      }
                    })}
                  >
                    <View className="flex-row items-center gap-4">
                      <Avatar
                        source={ item?.user?.profile_image !== null ? {uri:item?.user?.profile_image} : require(`../../../public/profile-image.jpg.webp`)}
                        size={40}
                        initials={item?.user?.name?.substring(0,2)?.toUpperCase()}
                      />
                      <View className="flex flex-col">
                        <Text
                          fontSize={14}
                          className="text-[14px] mb-1 font-[Kanit-Regular]"
                        >
                          {item?.user?.name}
                        </Text>
                        <View className="flex-row items-center justify-between gap-1">
                          <Text
                            fontSize={12}
                            className="text-[12px] text-[#666666] font-[Kanit-Light]"
                          >
                            {rideDetail?.pickUpStop?.address}
                          </Text>
                          {swap(
                            <ArrowRight size={10} color="#A5A5A5" />,
                            <ArrowLeft size={10} color="#A5A5A5" />
                          )}
                          <Text
                            fontSize={12}
                            className="text-[12px] text-[#666666] font-[Kanit-Light]"
                          >
                            {rideDetail?.dropOffStop?.address}
                          </Text>
                        </View>
                      </View>
                    </View>

                  </TouchableOpacity>
                }}
                ListEmptyComponent={() => <View className="justify-center items-center" ><Text>No Passengers Found</Text></View>}
                ItemSeparatorComponent={() => <Separator className="my-1 border-t !border-dashed !border-[#CDCDCD] bg-transparent" />}
              />
            </View>
            <View className="px-8 py-4 gap-4 rounded-none bg-white">
              <Text fontSize={17} className="text-[17px] font-[Kanit-Regular]">
                {t("rideDetails.priceSummary")}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text fontSize={15} className="text-[15px] font-[Kanit-Light]">
                  {passengerCount === 1 
                    ? t("rideDetails.onePassenger") 
                    : `${passengerCount} ${t("rideDetails.passengers")}`}
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
                    {rideDetail?.rideAmount?.amount}
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
                  SR  {rideDetail?.serviceAmount}
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text
                  fontSize={12}
                  className="flex-1 text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  Service Fee ({rideDetail?.platformFeePercentage}%)
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
                  SR {rideDetail?.platformFeeAmount}
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text
                  fontSize={12}
                  className="flex-1 text-[12px] text-[#666666] font-[Kanit-Light]"
                >
                  VAT ({rideDetail?.vatPercentage}%)
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
                  SR {rideDetail?.vatAmount}
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
                  SR {rideDetail?.totalAmount}
                </Text>
              </View>
              <View className="flex-row items-center justify-center py-4">
                <TouchableOpacity
                  className="bg-[#FF4848] rounded-full h-[55px] w-full px-8 cursor-pointer flex items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: "/(publish)/your-ride", params: {
                      ride_id: rideDetail?.rideId?.id,
                      ride_amount_id: rideDetail?.rideAmount?.id
                    }
                  })}
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
