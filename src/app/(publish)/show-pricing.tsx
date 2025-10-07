import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import Direction4 from "../../../public/direction4.svg";
import MinusRed from "../../../public/minus-red.svg";
import PlusRed from "../../../public/plus-red.svg";
import Direction5 from "../../../public/direction5.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { useCreateRide } from "@/service/ride-booking";
import { RideDetails } from "@/types/ride-types";
import { combineDateAndTimeToUTC } from "@/utils/convertdatetime";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ShowPricing() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const { setRideField, ride, selectedPlaces,polyline } = useCreateRideStore();

  // Build full route
  const fullRoute = useMemo(() => {
    const route = [];
    if (ride.pickup_address?.trim() && typeof ride.pickup_lat === "number" && typeof ride.pickup_lng === "number") {
      route.push({ address: ride.pickup_address, lat: ride.pickup_lat, lng: ride.pickup_lng });
    }
    selectedPlaces.forEach((place) => {
      if (place.address?.trim() && typeof place.lat === "number" && typeof place.lng === "number") {
        route.push(place);
      }
    });
    if (ride.destination_address?.trim() && typeof ride.destination_lat === "number" && typeof ride.destination_lng === "number") {
      route.push({ address: ride.destination_address, lat: ride.destination_lat, lng: ride.destination_lng });
    }
    return route;
  }, [ride, selectedPlaces]);

  const numSegments = Math.max(0, fullRoute.length - 1);
  const [segmentPrices, setSegmentPrices] = useState<number[]>(Array(numSegments).fill(10));

  useEffect(() => {
    if (numSegments <= 0) {
      setSegmentPrices([]);
      return;
    }
    if (ride.segmentPrices && ride.segmentPrices.length === numSegments) {
      setSegmentPrices([...ride.segmentPrices]);
    } else {
      setSegmentPrices(Array(numSegments).fill(10));
    }
  }, [numSegments, ride.segmentPrices]);

  const clampPrice = (value: number) => Math.max(10, Math.min(14000, value));
  const clampSeatPrice = (value: number) => Math.max(10, Math.min(14000, value));

  const updateSegmentPrice = (index: number, delta: number) => {
    setSegmentPrices((prev) => {
      const newPrices = [...prev];
      newPrices[index] = clampPrice(newPrices[index] + delta);
      return newPrices;
    });
  };

  const updatePricePerSeat = (delta: number) => {
    const newPrice = clampSeatPrice((ride.price_per_seat || 10) + delta);
    setRideField("price_per_seat", newPrice);
  };

  // ✅ Handle Continue: save all required data
  const handleContinue = () => {
    // 1. Save segment prices (for returning to this screen)
    setRideField("segmentPrices", segmentPrices);

    // 2. Build ordered stops
    const stops = fullRoute.map((point, idx) => ({
      address: point.address,
      lat: point.lat,
      lng: point.lng,
      order: idx + 1,
    }));

    // 3. Build full pricing matrix from segmentPrices
    const n = fullRoute.length;
    const prices = [];

    if (n >= 2) {
      const prefix = [0];
      for (let i = 0; i < segmentPrices.length; i++) {
        prefix.push(prefix[i] + segmentPrices[i]);
      }

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          prices.push({
            pickup_order: i + 1,
            drop_order: j + 1,
            amount: prefix[j] - prefix[i],
          });
        }
      }
    }

    // 4. Save stops and prices matrix
    setRideField("stops", stops);
    setRideField("prices", prices);
    
    // console.log("stopr===============",stops,"===================",prices)
    // 5. Navigate
    // router.push("/(publish)/return");
    handlePublishRide()
  };

  const handlePublishRide = async()=>{
    const postData ={
      "vehicle_id": ride.vehicle_id,
      "pickup_lat": ride.pickup_lat,
      "pickup_lng": ride.pickup_lng,
      "pickup_address": ride.pickup_address,
      "drop_lat": ride.destination_lat,
      "drop_lng": ride.destination_lng,
      "drop_address": ride.destination_address,
      "date":ride.date,
      "pickup_time": ride.time,
      "drop_time": ride.time,
      "passengers": ride.available_seats,
      "ride_route": polyline,
      "max_2_in_back": ride.max_2_in_back,
      "stops": ride.stops,
      "prices": ride.prices
    } as RideDetails 
    console.log("postdata=============",postData)
    const response = await useCreateRide(postData)
    console.log(response,"create-----ride------response")
    if(response){
      router.push("/(publish)/return");
    }
  }

  if (!loaded) return null;

  if (fullRoute.length < 2) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 p-4">
          <View className="items-center justify-center flex-1 px-6">
            <Text className="text-red-500 text-center text-base md:text-lg mb-6">
              {t("showPricing.insufficientRouteData")}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("..")}
              className="mt-4 bg-gray-200 rounded-full py-3 px-8 items-center justify-center"
            >
              <Text className="text-gray-800 font-[Kanit-Medium]">
                {t("common.back")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const heroHeight = Math.max(200, SCREEN_WIDTH * 0.55);
  const currentSeatPrice = ride.price_per_seat ?? 10;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} className="flex-1">
        {/* Hero: Full trip + price_per_seat */}
        <View style={{ height: heroHeight }}>
          <ImageBackground
            source={require("../../../public/hero.png")}
            className="flex-1 w-full"
            resizeMode="cover"
          >
            <View className="flex-1 max-w-screen-lg w-full mx-auto px-4 pt-10 md:px-6 md:pt-12">
              <View className="flex-row items-center gap-3 md:gap-4 mb-5 md:mb-6">
                <TouchableOpacity
                  onPress={() => router.replace("..")}
                  activeOpacity={0.8}
                  className="rounded-full w-10 h-10 md:w-11 md:h-11 bg-white/20 items-center justify-center"
                >
                  {swap(
                    <ChevronLeft color="#ffffff" size={20} />,
                    <ChevronRight color="#ffffff" size={20} />
                  )}
                </TouchableOpacity>
                <Text className="text-lg md:text-xl lg:text-2xl text-white font-[Kanit-Medium]">
                  {t("showPricing.rideDetails")}
                </Text>
              </View>

              <View className="flex-row items-start gap-3 md:gap-4">
                <Direction4 width={32} height={32} className="mt-1" />
                <View className="flex-1">
                  <Text className="text-xs md:text-sm text-[#DEDEDE] font-[Kanit-Light]">
                    {t("showPricing.pickup")}
                  </Text>
                  <Text className="text-sm md:text-base text-white font-[Kanit-Regular] mb-2">
                    {fullRoute[0].address}
                  </Text>
                  <Text className="text-xs md:text-sm text-[#DEDEDE] font-[Kanit-Light]">
                    {t("showPricing.drop")}
                  </Text>
                  <Text className="text-sm md:text-base text-white font-[Kanit-Regular]">
                    {fullRoute[fullRoute.length - 1].address}
                  </Text>
                </View>

                {/* ✅ price_per_seat control */}
                <View className="flex-row items-center gap-2 md:gap-3 ml-auto">
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(-10)}
                    disabled={currentSeatPrice <= 10}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${
                      currentSeatPrice <= 10 ? "opacity-40" : "bg-white/20"
                    }`}
                  >
                    <MinusRed width={16} height={16} />
                  </TouchableOpacity>
                  <View className="min-w-[60px] items-center">
                    <Text className="text-xs md:text-sm text-white font-[Inter] font-semibold">
                      SR {currentSeatPrice}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(10)}
                    disabled={currentSeatPrice >= 4000}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${
                      currentSeatPrice >= 4000 ? "opacity-40" : "bg-white/20"
                    }`}
                  >
                    <PlusRed width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Segment List: for internal pricing matrix */}
        <View className="px-4 pt-6 md:px-6">
          {fullRoute.slice(0, -1).map((from, index) => {
            const to = fullRoute[index + 1];
            const price = segmentPrices[index] ?? 10;

            const fromLabel = index === 0 ? t("showPricing.pickup") : t("showPricing.stopover");
            const toLabel = index === fullRoute.length - 2 ? t("showPricing.drop") : t("showPricing.stopover");

            return (
              <View key={index} className="flex-row items-start gap-3 md:gap-4 py-4 border-b border-gray-100">
                <Direction5 width={32} height={32} className="mt-1.5" />
                <View className="flex-1">
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">
                    {fromLabel}
                  </Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular] mb-1.5">
                    {from.address}
                  </Text>
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">
                    {toLabel}
                  </Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular]">
                    {to.address}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 md:gap-3">
                  <TouchableOpacity
                    onPress={() => updateSegmentPrice(index, -10)}
                    disabled={price <= 10}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center ${
                      price <= 10 ? "opacity-50" : "bg-gray-100"
                    }`}
                  >
                    <MinusRed width={16} height={16} />
                  </TouchableOpacity>
                  <Text className="text-xs md:text-sm text-black font-[Inter] font-medium min-w-[65px] text-center">
                    SR {price}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateSegmentPrice(index, 10)}
                    disabled={price >= 4000}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center ${
                      price >= 4000 ? "opacity-50" : "bg-gray-100"
                    }`}
                  >
                    <PlusRed width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-6 md:pb-6">
        <TouchableOpacity
          onPress={handleContinue}
          className="rounded-full h-14 md:h-[55px] bg-[#FF4848] items-center justify-center shadow-lg"
        >
          <Text className="text-base md:text-xl text-white font-[Kanit-Medium]">
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default ShowPricing;