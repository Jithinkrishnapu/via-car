/* -------------------------------------------------
   SearchRide.tsx  –  complete file
-------------------------------------------------- */
import LocationSelect from "./location-select";
import PassengerSelect from "./passenger-select";
import DatePicker from "./date-picker";
import { router } from "expo-router";
import {
  TouchableOpacity,
  View,
  Animated,          // ← added
} from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { useState, useRef, useEffect } from "react";
import { useSearchRideStore } from "@/store/useSearchRideStore";

interface SearchRideProps {
  onModalStateChange?: (isOpen: boolean) => void;
}

function SearchRide({ onModalStateChange }: SearchRideProps) {
  const { t } = useTranslation("components");
  const { setIsPublish} = useStore();
  const { to,from} = useSearchRideStore();

  const defaultDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  const [selectedPassenger, setSelectedPassenger] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalStateChange = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
    onModalStateChange?.(isOpen);
  };

  /* -------- neat error banner state -------- */
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    // animate banner in/out when error text changes
    if (error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 3000); // auto-hide after 3s
  };

  const handleSearch = () => {
    if (!from || !to) {
      showError(t("searchRide.missingLocation"));
      return;
    }
    if (!selectedDate) {
      showError(t("searchRide.missingDate"));
      return;
    }

    setIsPublish(false);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    router.push({
      pathname: "/(booking)/ride",
      params: { date: formattedDate, passengers: selectedPassenger },
    });
  };

  /* ------------------ UI ------------------ */
  return (
    <View className="rounded-t-[28px] -mt-[28px] bg-white pb-8 z-10 pt-4 px-6 max-w-[500px] w-full mx-auto flex flex-col gap-3">
      <Text
        fontSize={22}
        className="text-[22px] text-black font-[Kanit-Regular] mb-1"
      >
        {t("searchRide.title")}
      </Text>

      {/* -------- neat error banner -------- */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          height: error ? "auto" : 0,
          overflow: "hidden",
        }}
        className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-1"
      >
        <Text className="text-sm text-red-700">{error}</Text>
      </Animated.View>

      <LocationSelect
        name="from"
        placeholder={t("searchRide.pickupPlaceholder")}
        onModalStateChange={handleModalStateChange}
      />
      <LocationSelect
        name="to"
        placeholder={t("searchRide.dropPlaceholder")}
        onModalStateChange={handleModalStateChange}
      />
      <DatePicker onSelect={(date) => setSelectedDate(date)} />
      <PassengerSelect
        initialCount={selectedPassenger}
        onCountChange={(value) => setSelectedPassenger(value)}
      />

      <TouchableOpacity
        className="bg-[#FF4848] rounded-full h-[52px] cursor-pointer w-full flex items-center justify-center mt-2"
        activeOpacity={0.8}
        onPress={handleSearch}
      >
        <Text
          fontSize={18}
          className="text-[18px] text-white font-[Kanit-Regular]"
        >
          {t("searchRide.searchButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default SearchRide;