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
import { useGetProfileDetails } from "@/service/auth";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { snackbarManager } from "@/utils/snackbar-manager";
import AlertDialog from "@/components/ui/alert-dialog";
import { getRouteDistance } from "@/services/mapService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ShowPricing() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();

  const { setRideField, ride, selectedPlaces, polyline } = useCreateRideStore();

  const [userDetails, setUserDetails] = useState<any>();
  const [loading, setLoading] = useState(false);
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

  const handleProfileDetails = async () => {
    const response = await useGetProfileDetails();
    if (response?.data) setUserDetails(response.data);
  };
  useEffect(() => { handleProfileDetails(); }, []);

  /* ---------- route helpers ---------- */
  const fullRoute = useMemo(() => {
    const r: any[] = [];
    if (ride.pickup_address?.trim() && typeof ride.pickup_lat === "number" && typeof ride.pickup_lng === "number") {
      r.push({ address: ride.pickup_address, lat: ride.pickup_lat, lng: ride.pickup_lng });
    }
    selectedPlaces.forEach((p) => {
      if (p.address?.trim() && typeof p.lat === "number" && typeof p.lng === "number") r.push(p);
    });
    if (ride.destination_address?.trim() && typeof ride.destination_lat === "number" && typeof ride.destination_lng === "number") {
      r.push({ address: ride.destination_address, lat: ride.destination_lat, lng: ride.destination_lng });
    }
    return r;
  }, [
    ride.pickup_address,
    ride.pickup_lat,
    ride.pickup_lng,
    ride.destination_address,
    ride.destination_lat,
    ride.destination_lng,
    selectedPlaces
  ]);

  const numSegments = Math.max(0, fullRoute.length - 1);
  // Only store prices for intermediate segments (not the full trip)
  const [segmentPrices, setSegmentPrices] = useState<number[]>(Array(numSegments).fill(10));

  // Update total price when segment prices change
  useEffect(() => {
    const sum = segmentPrices.reduce((acc, curr) => acc + curr, 0);
    if (sum > 0 && sum !== ride.price_per_seat) {
      setRideField("price_per_seat", sum);
    }
  }, [segmentPrices]);

  // Initialize segment prices
  useEffect(() => {
    const calculatePrices = async () => {
      if (numSegments <= 0) { 
        setSegmentPrices([]); 
        return; 
      }
      
      if (ride.segmentPrices && ride.segmentPrices.length === numSegments) {
        setSegmentPrices([...ride.segmentPrices]);
      } else {
        // Calculate distances for segments
        const newPrices = [];
        
        for(let i=0; i < numSegments; i++) {
            const p1 = fullRoute[i];
            const p2 = fullRoute[i+1];
            
            // Use Google Maps API for real distance
            const dist = await getRouteDistance(
              { lat: p1.lat, lng: p1.lng },
              { lat: p2.lat, lng: p2.lng }
            );
            
            const price = Math.round(dist * 2); // 2 SR per km
            newPrices.push(clampPrice(price));
        }
        setSegmentPrices(newPrices);
      }
    };

    calculatePrices();
  }, [numSegments, fullRoute]); // Removed ride.segmentPrices from dependency to avoid infinite loop if it changes

  const clampPrice = (v: number) => Math.max(10, Math.min(14000, v));

  const updateSegmentPrice = (idx: number, delta: number) =>
    setSegmentPrices((p) => {
      const copy = [...p];
      copy[idx] = clampPrice(copy[idx] + delta);
      return copy;
    });

  const updatePricePerSeat = (delta: number) => {
    if (numSegments > 0 && segmentPrices.length === numSegments) {
      const currentSum = segmentPrices.reduce((a, b) => a + b, 0);
      const targetSum = clampPrice(currentSum + delta);
      
      // Prevent going below minimum possible price (10 per segment)
      if (targetSum < numSegments * 10) return;

      let remaining = targetSum;
      const newPrices = segmentPrices.map((p, index) => {
        // For the last segment, we'll assign the remainder to ensure exact sum
        if (index === segmentPrices.length - 1) return 0;
        
        // Calculate proportional share
        let share = Math.round((p / currentSum) * targetSum);
        
        // Ensure minimum 10
        share = Math.max(10, share);
        
        remaining -= share;
        return share;
      });
      
      // Assign remainder to last segment
      newPrices[segmentPrices.length - 1] = Math.max(10, remaining);
      
      // If the math forced the sum to be different (due to clamping), 
      // we might deviate slightly from targetSum, which is acceptable 
      // as long as we maintain valid segment prices.
      
      setSegmentPrices(newPrices);
    } else {
      setRideField("price_per_seat", clampPrice((ride.price_per_seat || 10) + delta));
    }
  };

  // Full trip price is the fixed price_per_seat from pricing screen
  const totalTripPrice = ride.price_per_seat ?? 10;

  /* ---------- CONTINUE ---------- */
  const handleContinue = async () => {
    setLoading(true);
    try {
      /* ---- build stops --------------------------------------------- */
      const stops = fullRoute.map((pt, i) => ({
        address: pt.address,
        lat: pt.lat,
        lng: pt.lng,
        order: i + 1,
      }));

      /* ---- build price matrix -------------------------------------- */
      const n = fullRoute.length;
      const prices: any[] = [];
      if (n >= 2) {
        // FIRST: Add the full trip price (pickup to final drop) - this is the fixed price_per_seat
        prices.push({
          pickup_order: 1,
          drop_order: n,
          amount: ride.price_per_seat || 10,
        });

        // THEN: Add prices for intermediate segments (stopovers)
        // Build prefix sum array using segmentPrices for intermediate stops
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
              drop_order: j + 1,
              amount: prefix[j] - prefix[i],
            });
          }
        }
      }

      /* ---- assemble payload ---------------------------------------- */
      const postData: RideDetails = {
        vehicle_id: ride.vehicle_id,
        pickup_lat: ride.pickup_lat,
        pickup_lng: ride.pickup_lng,
        pickup_address: ride.pickup_address,
        drop_lat: ride.destination_lat,
        drop_lng: ride.destination_lng,
        drop_address: ride.destination_address,
        date: ride.date,
        pickup_time: ride.time,
        drop_time: ride.time,
        passengers: ride.available_seats,
        ride_route: polyline,
        max_2_in_back: ride.max_2_in_back,
        stops,
        prices,
      };

      console.log(postData, "=====================postdata")
      
      /* ---- hit the endpoint ---------------------------------------- */
      const { ok, data, status } = await useCreateRide(postData);

      if (ok && data?.data?.id) {
        router.push({
          pathname: '/(publish)/return',
          params: {
            ride_id: data.data.id,
            ride_amount_id: data.data.rideAmounts?.[0]?.pickup_id,
          },
        });
      } else {
        // Handle API errors with proper error messages
        const errorMessage = data?.message || data?.error || data?.msg || 'Failed to create ride';

        if (status >= 400 && status < 500) {
          // Client errors (400-499) - show in dialog
          showErrorDialog(
            t("error.rideCreationFailed") || "Ride Creation Failed",
            errorMessage,
            "error"
          );
        } else if (status >= 500) {
          // Server errors (500+) - show in dialog with retry
          showErrorDialog(
            t("error.serverError") || "Server Error",
            t("error.serverErrorMessage") || "Something went wrong on our end. Please try again later.",
            "error",
            true
          );
        } else {
          // Unknown error - show in dialog
          showErrorDialog(
            t("error.unknownError") || "Error",
            errorMessage,
            "error"
          );
        }
      }
    } catch (err: any) {
      console.error('Ride creation error:', err);

      // Check if it's a network error
      if (err.name === 'TypeError' || err.message?.includes('Network') || err.message?.includes('fetch')) {
        // Network errors - show in snackbar
        snackbarManager.showNetworkError(
          t("error.networkError") || "Network error. Please check your connection and try again.",
          handleContinue
        );
      } else {
        // Other errors - show in dialog with retry
        const errorMessage = err?.message || err?.error || err?.msg || 'Something went wrong';
        showErrorDialog(
          t("error.unexpectedError") || "Unexpected Error",
          errorMessage,
          "error",
          true
        );
      }
    } finally {
      setLoading(false);
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
              <Text className="text-gray-800 font-[Kanit-Medium]">{t("common.back")}</Text>
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
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 90 }} className="flex-1">
        {/* Hero */}
        <View style={{ height: heroHeight }}>
          <ImageBackground source={require("../../../public/hero.png")} className="flex-1 w-full" resizeMode="cover">
            <View className="flex-1 max-w-screen-lg w-full mx-auto px-4 pt-10 md:px-6 md:pt-12">
              {/* Back Button */}
              <View className="flex-row items-center gap-3 mb-4">
                <TouchableOpacity
                  className="rounded-full size-[46px] bg-white/20 items-center justify-center"
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  {swap(<ChevronLeft size={20} color="#ffffff" />, <ChevronRight size={20} color="#ffffff" />)}
                </TouchableOpacity>
                <Text className="text-lg md:text-xl lg:text-2xl text-white font-[Kanit-Medium]">
                  {t("showPricing.rideDetails")}
                </Text>
              </View>

              <View className="flex-row items-start gap-3 md:gap-4">
                <Direction4 width={32} height={32} className="mt-1" />
                <View className="flex-1">
                  <Text className="text-xs md:text-sm text-[#DEDEDE] font-[Kanit-Light]">{t("showPricing.pickup")}</Text>
                  <Text className="text-sm md:text-base text-white font-[Kanit-Regular] mb-2">{fullRoute[0].address}</Text>
                  <Text className="text-xs md:text-sm text-[#DEDEDE] font-[Kanit-Light]">{t("showPricing.drop")}</Text>
                  <Text className="text-sm md:text-base text-white font-[Kanit-Regular]">{fullRoute[fullRoute.length - 1].address}</Text>
                </View>

                {/* Total trip price (readonly when segments exist) */}
                <View className="flex-row items-center gap-2 md:gap-3 ml-auto">
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(-10)}
                    disabled={totalTripPrice <= Math.max(10, numSegments * 10)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${totalTripPrice <= Math.max(10, numSegments * 10) ? "opacity-40" : "bg-white/20"}`}
                  >
                    <MinusRed width={16} height={16} />
                  </TouchableOpacity>
                  <View className="min-w-[60px] items-center">
                    <Text className="text-xs md:text-sm text-white font-[Inter] font-semibold">SR {totalTripPrice}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => updatePricePerSeat(10)}
                    disabled={totalTripPrice >= 4000}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center ${totalTripPrice >= 4000 ? "opacity-40" : "bg-white/20"}`}
                  >
                    <PlusRed width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Segments - All editable */}
        <View className="px-4 pt-6 md:px-6">
          {fullRoute.slice(0, -1).map((from, idx) => {
            const to = fullRoute[idx + 1];
            const price = segmentPrices[idx] ?? 10;
            const fromLabel = idx === 0 ? t("showPricing.pickup") : t("showPricing.stopover");
            const toLabel = idx === fullRoute.length - 2 ? t("showPricing.drop") : t("showPricing.stopover");

            return (
              <View key={idx} className="flex-row items-start gap-3 md:gap-4 py-4 border-b border-gray-100">
                <Direction5 width={32} height={32} className="mt-1.5" />
                <View className="flex-1">
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">{fromLabel}</Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular] mb-1.5">{from.address}</Text>
                  <Text className="text-[10px] md:text-xs text-gray-500 font-[Kanit-Light] uppercase tracking-wider">{toLabel}</Text>
                  <Text className="text-xs md:text-sm text-black font-[Kanit-Regular]">{to.address}</Text>
                </View>
                {/* All segments are now editable */}
                <View className="flex-row items-center gap-2 md:gap-3">
                  <TouchableOpacity
                    onPress={() => updateSegmentPrice(idx, -10)}
                    disabled={price <= 10}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center ${price <= 10 ? "opacity-50" : "bg-gray-100"}`}
                  >
                    <MinusRed width={16} height={16} />
                  </TouchableOpacity>
                  <Text className="text-xs md:text-sm text-black font-[Inter] font-medium min-w-[65px] text-center">SR {price}</Text>
                  <TouchableOpacity
                    onPress={() => updateSegmentPrice(idx, 10)}
                    disabled={price >= 4000}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full items-center justify-center ${price >= 4000 ? "opacity-50" : "bg-gray-100"}`}
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
          disabled={loading}
          className={`rounded-full h-14 md:h-[55px] items-center justify-center shadow-lg flex-row gap-2 ${
            loading ? 'bg-[#FF4848]/60' : 'bg-[#FF4848]'
          }`}
          activeOpacity={loading ? 1 : 0.8}
        >
          {loading && <ActivityIndicator size="small" color="#fff" />}
          <Text className={`text-base md:text-xl font-[Kanit-Medium] ${
            loading ? 'text-white/80' : 'text-white'
          }`}>
            {loading ? t("common.processing") || "Processing..." : t("common.continue")}
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
        confirmText={errorDialog.showRetry ? t("common.retry") || "Retry" : t("common.ok") || "OK"}
        onConfirm={errorDialog.showRetry ? handleContinue : closeErrorDialog}
      />
    </SafeAreaView>
  );
}

export default ShowPricing;