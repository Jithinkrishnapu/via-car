import { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import MinusLarge from "../../../public/minus-large.svg";
import PlusLarge from "../../../public/plus-large.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { getRecommendedPrice } from "@/service/ride-booking";

function Pricing() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [amount, setAmount] = useState(10);
  const [recommendedPriceRange, setRecommendedPriceRange] = useState<string | null>(null);
  const [recommendedMidPrice, setRecommendedMidPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const { polyline, setRideField } = useCreateRideStore();

  // Fetch recommended price on component mount
  useEffect(() => {
    const fetchRecommendedPrice = async () => {
      if (!polyline) {
        console.warn("No polyline available for price calculation");
        setLoadingPrice(false);
        return;
      }

      try {
        setLoadingPrice(true);
        const response = await getRecommendedPrice(polyline);
        
        if (response?.data?.recommended_price) {
          const priceRange = response.data.recommended_price; // e.g., "37 - 56"
          setRecommendedPriceRange(priceRange);
          
          // Calculate mid-point of the range
          const prices = priceRange.split('-').map((p: string) => Number(p.trim()));
          if (prices.length === 2 && !isNaN(prices[0]) && !isNaN(prices[1])) {
            const midPrice = Math.round((prices[0] + prices[1]) / 2);
            setRecommendedMidPrice(midPrice);
            setAmount(midPrice); // Set mid-point as default amount
          }
        }
      } catch (error) {
        console.error("Failed to fetch recommended price:", error);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchRecommendedPrice();
  }, [polyline]);

  const clamp = (val: number) => Math.max(0, Math.min(14000, val));

  const adjustAmount = (delta: number) => {
    setAmount((prev) => clamp(prev + delta));
  };

  const handleTextChange = (text: string) => {
    const num = Number(text.replace(/[^0-9]/g, ""));
    if (!Number.isNaN(num)) setAmount(clamp(num));
  };

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white font-[Kanit-Regular]">
      <View className="max-w-lg w-full self-center pt-16 px-4 lg:px-12">
        {/* Adjuster */}
        <View className="flex-row items-center justify-center space-x-2 px-6">
          <TouchableOpacity
            onPress={() => adjustAmount(-10)}
            activeOpacity={0.8}
            disabled={amount === 10}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <MinusLarge width={32} height={32} />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <TextInput
              value={`SR ${amount.toLocaleString()}`}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              className="text-[60px] text-[#00665A] font-[Kanit-SemiBold] text-center"
              style={{ fontSize: 60 }}
            />
          </View>

          <TouchableOpacity
            onPress={() => adjustAmount(10)}
            activeOpacity={0.8}
            disabled={amount === 14000}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <PlusLarge width={32} height={32} />
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View
          className="my-6"
          style={{
            borderTopWidth: 1,
            borderColor: "#CDCDCD",
            borderStyle: "dashed",
          }}
        />

        {/* Recommended Badge */}
        {loadingPrice ? (
          <View className="self-center mb-4 py-4">
            <ActivityIndicator size="small" color="#14B968" />
            <Text className="text-sm text-gray-500 mt-2 text-center font-[Kanit-Light]">
              {t("Loading recommended price...")}
            </Text>
          </View>
        ) : recommendedPriceRange ? (
          <View className="self-center mb-4">
            <View className="bg-[#14B968] rounded-full px-6 py-1">
              <Text
                fontSize={12}
                className="text-[12px] lg:text-lg text-white font-[Kanit-Light]"
              >
                {t("pricing.recommended")}: SR {recommendedPriceRange}
              </Text>
            </View>
            {recommendedMidPrice && amount !== recommendedMidPrice && (
              <TouchableOpacity
                onPress={() => setAmount(recommendedMidPrice)}
                className="mt-2 bg-gray-100 border border-[#14B968] rounded-full px-4 py-1"
                activeOpacity={0.7}
              >
                <Text
                  fontSize={10}
                  className="text-[10px] lg:text-sm text-[#14B968] font-[Kanit-Light] text-center"
                >
                  SR {recommendedMidPrice}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        <Text
          fontSize={12}
          className="text-[12px] lg:text-base text-[#666666] font-[Kanit-Light] text-center"
        >
          {t("pricing.hint")}
        </Text>
      </View>

      {/* Footer Buttons */}
      <View className="absolute bottom-8 left-0 right-0 px-6 flex-row gap-4">
        <TouchableOpacity
          onPress={() => {
            setRideField("price_per_seat", amount);
            router.push("/(publish)/show-pricing");
          }}
          activeOpacity={0.8}
          className="flex-1 rounded-full h-[55px] bg-[#FF4848] items-center justify-center"
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Pricing;