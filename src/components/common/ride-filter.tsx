import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, TouchableOpacity, Animated } from "react-native";
import Text from "./text";
import StopWatch from "../../../public/stopwatch.svg";
import Walk from "../../../public/walk.svg";
import Time from "../../../public/time.svg";
import Coin from "../../../public/coins.svg";
import { XIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import CheckboxCard from "../ui/checkbox-card";
import { useTranslation } from "react-i18next";

interface Props {
  close: (filters: {
    sortOption: number;
    numberOfStops: string;
    verifiedProfile: boolean;
    aminities:Record<string, boolean>
  }) => void;
}

const RideFilters = ({ close }: Props) => {
  const { t } = useTranslation("components");
  const [sortOption, setSortOption] = useState(
    t("rideFilter.earliestDeparture")
  );
  const [numberOfStops, setNumberOfStops] = useState("0");
  const [verifiedProfile, setVerifiedProfile] = useState(true);
  const [checkedItems, setCheckedIds] = useState<Record<string, boolean>>();
  const [carModel, setCarModel] = useState(t("rideFilter.lastThreeYears"));

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: verifiedProfile ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [verifiedProfile, anim]);

  // Update state values when language changes
  useEffect(() => {
    setSortOption(t("rideFilter.earliestDeparture"));
    setCarModel(t("rideFilter.lastThreeYears"));
  }, [t]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 30 - 12 - 2],
  });

  const sortOptions = [
    { label: t("rideFilter.earliestDeparture"), Icon: Time },
    { label: t("rideFilter.lowestPrice"), Icon: Coin },
    { label: t("rideFilter.closeToDeparture"), Icon: Walk },
    { label: t("rideFilter.closeToArrival"), Icon: Walk },
    { label: t("rideFilter.shortestRide"), Icon: StopWatch },
  ];

  const stopOptions = [
    { label: t("rideFilter.directRidesOnly"), value: "0", count: 40 },
    { label: t("rideFilter.oneStop"), value: "1", count: 5 },
    { label: t("rideFilter.twoStopsOrMore"), value: "2+", count: 25 },
  ];

  const toSortCode = (label: string): number => {
    const map: Record<string, number> = {
      [t("rideFilter.earliestDeparture")]: 1,
      [t("rideFilter.lowestPrice")]: 2,
      [t("rideFilter.closeToDeparture")]: 3,
      [t("rideFilter.closeToArrival")]: 4,
      [t("rideFilter.shortestRide")]: 5,
    };
    return map[label] ?? 1; // fallback → 1
  };

  const toStopCode = (val: string): string => {
    switch (val) {
      case "0":
        return "direct_only";
      case "1":
        return "1_stop";
      case "2+":
        return "2_stops_or_more";
      default:
        return "direct_only";
    }
  };

  const carModelOptions = [
    {
      label: t("rideFilter.lastThreeYears"),
      value: t("rideFilter.lastThreeYears"),
      count: 25,
    },
    {
      label: t("rideFilter.lastFiveYears"),
      value: t("rideFilter.lastFiveYears"),
      count: 45,
    },
    { label: t("rideFilter.all"), value: t("rideFilter.all"), count: 70 },
  ];


  console.log("checked==========",checkedItems)

  return (
    <ScrollView>
      <View className="px-[27px] pt-6 pb-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-[20px]">
            <TouchableOpacity
              className="size-[45px] rounded-full border border-[#EBEBEB] bg-white items-center justify-center"
              activeOpacity={0.8}
              onPress={() =>
                close({
                  sortOption: toSortCode(sortOption),
                  numberOfStops: toStopCode(numberOfStops),
                  verifiedProfile,
                  aminities:checkedItems!
                })
              }
            >
              <XIcon />
            </TouchableOpacity>
            <Text fontSize={25} className="text-[25px] font-[Kanit-Regular]">
              {t("rideFilter.filter")}
            </Text>
          </View>
          <TouchableOpacity onPress={() =>
            close({
              sortOption: 1,         // Default sort (earliestDeparture)
              numberOfStops: "direct_only", // Default stops (update based on your logic)
              verifiedProfile,
              aminities:checkedItems!
            })
          }>
            <Text
              fontSize={18}
              className="text-[18px] text-[#666666] font-[Kanit-Light]"
            >
              {t("rideFilter.resetAll")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort by */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            fontSize={18}
            className="text-[18px] text-black font-[Kanit-Medium]"
          >
            {t("rideFilter.sortBy")}
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("rideFilter.clearAll")}
            </Text>
          </TouchableOpacity>
        </View>

        {sortOptions.map(({ label, Icon }) => (
          <TouchableOpacity
            key={label}
            onPress={() => setSortOption(label)}
            className="flex-row justify-between items-center py-2"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-[23px]">
              <View
                className={`size-[22px] rounded-full border-2 mr-2 items-center justify-center ${sortOption === label ? "border-gray-400" : "border-gray-400"
                  }`}
              >
                {sortOption === label && (
                  <View className="size-[11px] bg-red-500 rounded-full" />
                )}
              </View>
              <Text
                fontSize={15}
                className="text-[15px] text-[#666666] font-[Kanit-Regular] leading-[30px]"
              >
                {label}
              </Text>
            </View>
            <Icon width={18} height={18} />
          </TouchableOpacity>
        ))}

        <View className="border-t border-dashed border-gray-300 my-4" />

        {/* Number of stops */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            fontSize={18}
            className="text-[18px] text-black font-[Kanit-Medium]"
          >
            {t("rideFilter.numberOfStops")}
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("rideFilter.clearAll")}
            </Text>
          </TouchableOpacity>
        </View>
        {stopOptions.map(({ label, value, count }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setNumberOfStops(value)}
            className="flex-row justify-between items-center py-2"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-[23px]">
              <View
                className={`size-[22px] rounded-full border-2 mr-2 items-center justify-center ${numberOfStops === value ? "border-red-500" : "border-gray-400"
                  }`}
              >
                {numberOfStops === value && (
                  <View className="size-[11px] bg-red-500 rounded-full" />
                )}
              </View>
              <Text
                fontSize={15}
                className="text-[15px] text-[#666666] font-[Kanit-Regular] leading-[38px]"
              >
                {label}
              </Text>
            </View>
            <Text
              fontSize={14}
              className="text-[14px] text-[#999999] font-[Kanit-Regular]"
            >
              {count}
            </Text>
          </TouchableOpacity>
        ))}

        <View className="border-t border-dashed border-gray-300 my-4" />

        {/* Trust and safety */}
        <Text
          fontSize={18}
          className="text-[18px] text-black font-[Kanit-Medium] mb-2"
        >
          {t("rideFilter.trustAndSafety")}
        </Text>
        <View className="flex-row justify-between items-center py-2">
          <Text
            fontSize={15}
            className="text-[15px] text-[#666666] font-[Kanit-Regular] leading-[38px]"
          >
            {t("rideFilter.verifiedProfile")}
          </Text>
          <View className="flex-row items-center gap-[18px]">
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Regular]"
            >
              35
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setVerifiedProfile((cur) => !cur)}
              className={cn(
                "border rounded-full w-[35px] p-[2px]",
                verifiedProfile ? "border-[#4CCE75]" : "border-gray-500"
              )}
            >
              <Animated.View
                style={{
                  transform: [{ translateX }],
                }}
              >
                <View
                  className={cn(
                    "w-[12px] h-[12px] rounded-full",
                    verifiedProfile ? "bg-[#4CCE75]" : "bg-gray-500"
                  )}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="border-t border-dashed border-gray-300 my-4" />

        {/* Amenities */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            fontSize={18}
            className="text-[18px] text-black font-[Kanit-Medium]"
          >
            {t("rideFilter.amenities")}
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("rideFilter.clearAll")}
            </Text>
          </TouchableOpacity>
        </View>
        <CheckboxCard setCheckedItem={setCheckedIds} />

        <View className="border-t border-dashed border-gray-300 my-4" />

        {/* Car model */}
        {/* <View className="flex-row justify-between items-center mb-2">
          <Text
            fontSize={18}
            className="text-[18px] text-black font-[Kanit-Medium]"
          >
            {t("rideFilter.carModel")}
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {t("rideFilter.clearAll")}
            </Text>
          </TouchableOpacity>
        </View>
        {carModelOptions.map(({ label, value, count }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setCarModel(value)}
            className="flex-row justify-between items-center py-2"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-[23px]">
              <View
                className={`size-[22px] rounded-full border-2 mr-2 items-center justify-center ${
                  carModel === value ? "border-red-500" : "border-gray-400"
                }`}
              >
                {carModel === value && (
                  <View className="size-[11px] bg-red-500 rounded-full" />
                )}
              </View>
              <Text
                fontSize={15}
                className="text-[15px] text-[#666666] font-[Kanit-Regular] leading-[38px]"
              >
                {label}
              </Text>
            </View>
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              {count}
            </Text>
          </TouchableOpacity>
        ))} */}
        <TouchableOpacity
          className="bg-[#FF4848] rounded-full h-[55px] justify-center items-center px-8 w-full my-4"
          onPress={() =>
            close({
              sortOption: toSortCode(sortOption), // 1-5
              numberOfStops: toStopCode(numberOfStops),
              verifiedProfile,
              aminities:checkedItems!
            })
          }
          activeOpacity={0.8}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("rideFilter.apply")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RideFilters;
