import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
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
import AlertDialog from "@/components/ui/alert-dialog";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ShowPricingReturn() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const { setRideField, ride, selectedPlaces, polyline } = useCreateRideStore();
  const [isLoading,setIsLoading] = useState<boolean>(false)
  const [errorDialog, setErrorDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
    showRetry: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "error",
    showRetry: false,
  });

  const showErrorDialog = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "error", showRetry: boolean = false) => {
    setErrorDialog({
      visible: true,
      title,
      message,
      type,
      showRetry,
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog(prev => ({ ...prev, visible: false }));
  };

  /* -------------------------------------------------
   * 1.  BUILD THE RETURN ROUTE  (reversed outbound)
   *     Destination → Stopovers (reversed) → Pickup
   * ------------------------------------------------- */
  const fullRoute = useMemo(() => {
    const outboundRoute = [];
    
    // Build outbound route first
    if (
      ride.pickup_address?.trim() &&
      typeof ride.pickup_lat === "number" &&
      typeof ride.pickup_lng === "number"
    ) {
      outboundRoute.push({
        address: ride.pickup_address,
        lat: ride.pickup_lat,
        lng: ride.pickup_lng,
      });
    }
    
    selectedPlaces.forEach((place) => {
      if (
        place.address?.trim() &&
        typeof place.lat === "number" &&
        typeof place.lng === "number"
      ) {
        outboundRoute.push(place);
      }
    });
    
    if (
      ride.destination_address?.trim() &&
      typeof ride.destination_lat === "number" &&
      typeof ride.destination_lng === "number"
    ) {
      outboundRoute.push({
        address: ride.destination_address,
        lat: ride.destination_lat,
        lng: ride.destination_lng,
      });
    }
    
    // Reverse for return trip: destination becomes pickup, pickup becomes destination
    return outboundRoute.slice().reverse();
  }, [ride, selectedPlaces]);

  const numSegments = Math.max(0, fullRoute.length - 1);

  /* -------------------------------------------------
   * 2.  SEGMENT PRICES - Initialize with default values
   * ------------------------------------------------- */
  const [segmentPrices, setSegmentPrices] = useState<number[]>(
    Array(numSegments).fill(10)
  );

  // Initialize segment prices
  useEffect(() => {
    if (numSegments <= 0) {
      setSegmentPrices([]);
      return;
    }
    // Initialize all segments with default price of 10
    setSegmentPrices(Array(numSegments).fill(10));
  }, [numSegments]);

  const clampPrice = (v: number) => Math.max(10, Math.min(14000, v));

  const updateSegmentPrice = (index: number, delta: number) =>
    setSegmentPrices((prev) => {
      const next = [...prev];
      next[index] = clampPrice(next[index] + delta);
      return next;
    });

  const updatePricePerSeat = (delta: number) => {
    const next = clampPrice((ride.price_per_seat ?? 10) + delta);
    setRideField("price_per_seat", next);
  };

  // Full trip price is the fixed price_per_seat
  const totalTripPrice = ride.price_per_seat ?? 10;

  /* -------------------------------------------------
   * 3.  CONTINUE  –  store canonical left->right data
   * ------------------------------------------------- */
  const handleContinue = () => {
    // 3a. remember what the driver typed (for this screen)
    setRideField("segmentPrices", segmentPrices);

    // 3b. build stops in REAL driving order  (already reversed)
    const stops = fullRoute.map((p, idx) => ({
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      order: idx + 1,
    }));

    // 3c. build pricing matrix  (prefix sums)
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

    setRideField("stops", stops);
    setRideField("prices", prices);
    handlePublishRide();
  };

  /* -------------------------------------------------
   * 4.  PUBLISH
   * ------------------------------------------------- */
  // const handlePublishRide = async()=>{
  //   const postData ={
  //     "vehicle_id": ride.vehicle_id,
  //     "pickup_lat": ride.pickup_lat,
  //     "pickup_lng": ride.pickup_lng,
  //     "pickup_address": ride.pickup_address,
  //     "drop_lat": ride.destination_lat,
  //     "drop_lng": ride.destination_lng,
  //     "drop_address": ride.destination_address,
  //     "date":ride.date,
  //     "pickup_time": ride.time,
  //     "drop_time": ride.time,
  //     "passengers": ride.available_seats,
  //     "ride_route": polyline,
  //     "max_2_in_back": ride.max_2_in_back,
  //     "stops": ride.stops,
  //     "prices": ride.prices
  //   } as RideDetails 
  //   console.log("postdata=============",postData)
  //   const { ok, data } = await useCreateRide(postData);
  //   console.log(data,"response----------data")
  //   if (ok && data?.data?.id ) {
  //       router.push({pathname:"/(publish)/publish-ride",params:{ride_id:data?.data?.id,ride_amount_id:data?.data?.rideAmounts[0].pickup_id}});
  //   } else {
  //     Alert.alert('Failed to create ride');
  //   }
  // }

  const handlePublishRide = async () => {
    setIsLoading(true);
    try {
      /* ---- build stops (return trip: destination → pickup) --------- */
      const stops = fullRoute.map((pt, i) => ({
        address: pt.address,
        lat    : pt.lat,
        lng    : pt.lng,
        order  : i + 1,
      }));
  
      /* ---- build price matrix -------------------------------------- */
      const n = fullRoute.length;
      const prices: any[] = [];
      if (n >= 2) {
        // FIRST: Add the full trip price (fixed price_per_seat)
        prices.push({
          pickup_order: 1,
          drop_order  : n,
          amount      : ride.price_per_seat || 10,
        });
  
        // THEN: Add prices for intermediate segments
        const prefix = [0];
        for (let i = 0; i < segmentPrices.length; i++) {
          prefix.push(prefix[i] + segmentPrices[i]);
        }
  
        // Generate all other possible pickup-drop combinations (excluding full trip)
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            // Skip the full trip as we already added it first
            if (i === 0 && j === n - 1) continue;
            
            prices.push({
              pickup_order: i + 1,
              drop_order  : j + 1,
              amount      : prefix[j] - prefix[i],
            });
          }
        }
      }
  
      /* ---- assemble payload (return trip coordinates) -------------- */
      const postData: RideDetails = {
        vehicle_id   : ride.vehicle_id,
        // Return trip: swap pickup and destination
        pickup_lat   : fullRoute[0].lat,
        pickup_lng   : fullRoute[0].lng,
        pickup_address: fullRoute[0].address,
        drop_lat     : fullRoute[fullRoute.length - 1].lat,
        drop_lng     : fullRoute[fullRoute.length - 1].lng,
        drop_address : fullRoute[fullRoute.length - 1].address,
        date         : ride.date,
        pickup_time  : ride.time,
        drop_time    : ride.time,
        passengers   : ride.available_seats,
        ride_route   : polyline, // Should be reversed polyline for return trip
        max_2_in_back: ride.max_2_in_back,
        stops,
        prices,
      };
        console.log(postData, "=====================postdata")
      /* ---- hit the endpoint ---------------------------------------- */
      const { ok, data } = await useCreateRide(postData);
  
      if (ok && data?.data?.id) {
        router.push({
          pathname:"/(publish)/publish-ride",
          params:{
            ride_id: data?.data?.id,
            ride_amount_id: data?.data?.rideAmounts[0].pickup_id
          }
        });
      } else {
        // Handle API response errors
        const errorMessage = data?.message || data?.error || 'Failed to create ride';
        const status = data?.status;
        
        if (status >= 400 && status < 500) {
          // Client errors (400-499)
          showErrorDialog(
            "Ride Creation Failed",
            errorMessage,
            "error"
          );
        } else if (status >= 500) {
          // Server errors (500+) - show with retry option
          showErrorDialog(
            "Server Error",
            "Something went wrong on our end. Please try again later.",
            "error",
            true
          );
        } else {
          // Unknown error
          showErrorDialog(
            "Error",
            errorMessage,
            "error"
          );
        }
      }
    } catch (err: any) {
      console.error('Error creating ride:', err);
      
      // Handle network and other errors
      const errorMessage = err?.message || err?.error || err?.msg || 'Something went wrong';
      
      if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('network')) {
        showErrorDialog(
          "Network Error",
          "Please check your internet connection and try again.",
          "warning",
          true
        );
      } else {
        showErrorDialog(
          "Unexpected Error",
          errorMessage,
          "error",
          true
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!loaded) return null;

  if (fullRoute.length < 2) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView bounces={false} className="flex-1 p-4">
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

  /* -------------------------------------------------
   * UI – almost identical to outbound, only labels
   * ------------------------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 90 }} className="flex-1">
        {/* Hero */}
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
                  {t("showPricing.rideDetails")} · {t("showPricing.return")}
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

                {/* Total trip price (editable) */}
                <View className="flex-row items-center gap-2 md:gap-3 ml-auto">
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(-10)}
                    disabled={totalTripPrice <= 10}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${
                      totalTripPrice <= 10 ? "opacity-40" : "bg-white/20"
                    }`}
                  >
                    <MinusRed width={16} height={16} />
                  </TouchableOpacity>
                  <View className="min-w-[60px] items-center">
                    <Text className="text-xs md:text-sm text-white font-[Inter] font-semibold">
                      SR {totalTripPrice}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(10)}
                    disabled={totalTripPrice >= 4000}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${
                      totalTripPrice >= 4000 ? "opacity-40" : "bg-white/20"
                    }`}
                  >
                    <PlusRed width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Segment list */}
        <View className="px-4 pt-6 md:px-6">
          {fullRoute.slice(0, -1).map((from, idx) => {
            const to = fullRoute[idx + 1];
            const price = segmentPrices[idx] ?? 10;

            const isFirst = idx === 0;
            const isLast = idx === fullRoute.length - 2;

            return (
              <View
                key={idx}
                className="flex-row items-start gap-3 md:gap-4 py-4 border-b border-gray-100"
              >
                <Direction5 width={32} height={32} className="mt-1.5" />
                <View className="flex-1">
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">
                    {isFirst ? t("showPricing.pickup") : t("showPricing.stopover")}
                  </Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular] mb-1.5">
                    {from.address}
                  </Text>
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">
                    {isLast ? t("showPricing.drop") : t("showPricing.stopover")}
                  </Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular]">
                    {to.address}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 md:gap-3">
                  <TouchableOpacity
                    onPress={() => updateSegmentPrice(idx, -10)}
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
                    onPress={() => updateSegmentPrice(idx, 10)}
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

      {/* Continue */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-6 md:pb-6">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={isLoading}
          className="rounded-full h-14 md:h-[55px] bg-[#FF4848] items-center justify-center shadow-lg"
        >
          {isLoading && <ActivityIndicator size="small" color="#fff" />}
          <Text className="text-base md:text-xl text-white font-[Kanit-Medium]">
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Dialog */}
      <AlertDialog
        visible={errorDialog.visible}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        type={errorDialog.type}
        confirmText={errorDialog.showRetry ? "Retry" : "OK"}
        onConfirm={errorDialog.showRetry ? handleContinue : closeErrorDialog}
      />
    </SafeAreaView>
  );
}

export default ShowPricingReturn;