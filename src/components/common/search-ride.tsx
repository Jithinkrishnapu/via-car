import LocationSelect from "./location-select";
import PassengerSelect from "./passenger-select";
import DatePicker from "./date-picker";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { useState } from "react";

function SearchRide() {
  const { t } = useTranslation("components");
  const {setIsPublish} = useStore()
  const defaultDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultDate
  );
  const [selectedPassenger, setSelectedPassenger] = useState('1');

  const handleSearch = () => {
    setIsPublish(false);
  
    const formattedDate = selectedDate?.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
    router.push({
      pathname: "/(booking)/ride",
      params: {
        date: formattedDate,
        passengers: selectedPassenger,
      },
    });
  };
  

  return (
    <View className="rounded-t-[32px] -mt-[20px] bg-white pb-10 z-10 pt-5 px-[30px] max-w-[500px] w-full mx-auto flex flex-col gap-[16px]">
      <Text
        fontSize={24}
        className="text-[24px] text-black font-[Kanit-Regular]"
      >
        {t("searchRide.title")}
      </Text>
      <LocationSelect
        name="from"
        placeholder={t("searchRide.pickupPlaceholder")}
      />
      <LocationSelect name="to" placeholder={t("searchRide.dropPlaceholder")} />
      <DatePicker onSelect={(date)=>setSelectedDate(date)} />
      <PassengerSelect initialCount={selectedPassenger} onCountChange={(value) => setSelectedPassenger(value)} />
      <TouchableOpacity
        className="bg-[#FF4848] rounded-full h-[58px] cursor-pointer w-full flex items-center justify-center"
        activeOpacity={0.8}
        onPress={handleSearch}
      >
        <Text
          fontSize={20}
          className="text-[20px] text-white font-[Kanit-Regular]"
        >
          {t("searchRide.searchButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default SearchRide;
