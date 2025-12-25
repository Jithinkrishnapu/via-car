import { Separator } from "@/components/ui/separator";
import { Link, router } from "expo-router";
import {
  ArrowRight,
  ArrowLeft,
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
  Alert,
} from "react-native";
import Text from "@/components/common/text";
import Verified from "../../../public/verified.svg";
import Chat from "../../../public/chat.svg";
import Direction from "../../../public/direction4.svg";
import ChatIcon from "../../../public/chat.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import MapComponent from "@/components/ui/map-view";
import { useStore } from "@/store/useStore";
import { useRoute } from "@react-navigation/native";
import { placeRoutes, useCreateBooking, useGetRideDetails } from "@/service/ride-booking";
import { useCallback, useEffect, useState } from "react";
import { RideDetail } from "@/types/ride-types";
import { useCreateRideStore } from "@/store/useRideStore";
import { useGetProfileDetails } from "@/service/auth";

function RideDetails() {

  const realRoadRoute = [
    {
      coordinates: [
        { latitude: 24.7136, longitude: 46.6753 }, // Riyadh - King Fahd Road
        { latitude: 24.8247, longitude: 46.7975 }, // Riyadh outskirts
        { latitude: 25.0619, longitude: 47.1429 }, // Highway 40 - Buqayq direction
        { latitude: 25.2847, longitude: 47.4823 }, // Buqayq area
        { latitude: 25.3619, longitude: 48.1429 }, // Halfway point
        { latitude: 25.4247, longitude: 48.5823 }, // Near Hofuf
        { latitude: 26.0619, longitude: 49.4429 }, // Approaching Dammam
        { latitude: 26.4242, longitude: 50.0881 }, // Dammam city center
      ],
      strokeColor: '#FF0000',
      strokeWidth: 6,
    }
  ];

  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const { isPublish } = useStore()
  const route = useRoute();
  const [rideDetail, setRideDetail] = useState<RideDetail>()
  const [routes, setRoutes] = useState()
  const { setPolyline,polyline:EncodedLine } = useCreateRideStore();


  const handleBookNow = async () => {
    const stored = await useAsyncStorage("userDetails").getItem()
    const userDetails = stored ? JSON.parse(stored) : null
    if (userDetails?.type === "login") {
      // router.push('/(booking)/payment')
      handleRideBooking()
    } else {
      router.replace('/login')
    }
  }

  const handleGetRideDetails = async () => {
    const routeParams = route?.params as { rideId?: string; ride_amount_id?: string } | undefined;
    const postData = {
      ride_id: routeParams?.rideId ? Number(routeParams.rideId) : 0,
      ride_amount_id: routeParams?.ride_amount_id ? Number(routeParams.ride_amount_id) : 0
    }
    console.log("postData========", postData)
    const response = await useGetRideDetails(postData)
    console.log("responde===========", response)
    if (response?.data) {
      // handleRoutes(response?.data)
      setRideDetail(response.data)
      setPolyline(response?.data?.rideId?.ride_route)
    }
  }


  const handleRideBooking = async () => {
    console.log("rideDetails============",rideDetail)
    const routeParams = route?.params as { passengers?: string } | undefined;
    const postData = {
      ride_id: rideDetail?.rideId?.id,
      passengers: Number(routeParams?.passengers || 1),
      pickup_lat: rideDetail?.pickUpStop?.lat,
      pickup_lng: rideDetail?.pickUpStop?.lng,
      pickup_address: rideDetail?.pickUpStop?.address,
      notes: 'Please wait at the main entrance',
      ride_amount_id: rideDetail?.rideAmount?.id,
    };
  
    try {
      const res = await useCreateBooking(postData);
      console.log('success ===========', res);
      router.push({ pathname: '/(booking)/payment', params: {booking_id:res?.data?.booking?.id, amount:res?.data?.booking?.totalAmount} });
    } catch (err: any) {
      // pick the best text to show
      const msg =
        err?.message ??
        err?.errors?.ride_id?.[0] ??
        'Something went wrong. Please try again.';
        console.log("message================",msg)
      Alert.alert('Booking failed', msg);
    }
  };

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


  console.log(rideDetail?.driver,"rideDetail?.driver============")


  useEffect(() => {
    handleGetRideDetails()
  }, [route,EncodedLine])

  if (!loaded) return null;
  return (
    <View className="flex-1 bg-[#F5F5F5] font-[Kanit-Regular]">
      {/* Sticky Hero Section */}
      <ImageBackground
        source={require("../../../public/hero.png")}
        className="absolute top-0 left-0 right-0 z-10 flex-col h-[260px]"
      >
        <View className="z-10 w-full h-max mx-auto px-6 pt-[60px] flex-col">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              className="rounded-full size-[40px] bg-white/20 flex-row items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              {swap(
                <ArrowLeft size={20} color="white" />,
                <ArrowRight size={20} color="white" />
              )}
            </TouchableOpacity>
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
                {rideDetail?.pickUpStop.address}
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
                {rideDetail?.dropOffStop?.address}
              </Text>
            </View>
            {(rideDetail?.pickUpStop as any)?.time && <View
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
                {(rideDetail?.pickUpStop as any)?.time?.slice(0, 5)}
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
            </View>}
          </View>
        </View>
      </ImageBackground>

      {/* Scrollable Content */}
      <ScrollView 
        bounces={false}
        contentContainerStyle={{ paddingTop: 260 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-[1410px] w-full mx-auto">
          <View className="flex-col gap-2">
           {EncodedLine && <View className="h-[280px] bg-white p-4" >
              <MapComponent markers={[]} />
            </View>}
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
            <View className="px-8 py-6 rounded-none bg-white">
              <View className="flex-row items-center justify-between">
                <Link href={`/(tabs)/user-profile`} className="flex-row items-start">
                  <View className="w-[40px]">
                    <Avatar
                      source={ rideDetail?.driver?.profile_image !== null ? {uri:rideDetail?.driver?.profile_image} : require(`../../../public/profile-image.jpg.webp`)}
                      size={40}
                      initials="CN"
                    />
                  </View>
                  <View className={swap("flex-col ml-4", "flex-col mr-4")}>
                    <View className="flex-row items-center gap-2">
                      <Text
                        fontSize={14}
                        className="text-[14px] mb-1 px-2 font-[Kanit-Regular]"
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
                    onPress={() => router.push({pathname:"/(inbox)/chat",params:{driver_id:rideDetail?.driver?.id,driver_name:rideDetail?.driver?.first_name}})}
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
                <View className="flex-wrap flex-row gap-[15px]">
                {(userDetails as any)?.travel_preferences?.[0]          // take the first (and only) string
                  ?.split(',')                                 // break it into real tags
                  .map((text: string) => (
                    <View
                      key={text}
                      className="border border-gray-200 rounded-full flex-row items-center px-4 py-2"
                    >
                      <ChatIcon width={21} height={21} />
                      <Text className="ml-2 text-sm font-[Kanit-Light]">{text.trim()}</Text>
                    </View>
                  ))}
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
                      pathname: "/(booking)/passenger-profile",
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
                ListEmptyComponent={()=><View className="justify-center items-center" ><Text>No Passengers Found</Text></View>}
                ItemSeparatorComponent={() => <Separator className="my-1 border-t !border-dashed !border-[#CDCDCD] bg-transparent" />}
              />
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
                  SR {rideDetail?.serviceAmount}
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
                  onPress={() => handleBookNow()}
                >
                  <Text
                    fontSize={19}
                    className="text-[19px] text-white font-[Kanit-Regular]"
                  >
                    {isPublish ? t("rideDetails.manageRide") : "Book Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default RideDetails;
