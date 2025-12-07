import {
  Check,
  SlidersHorizontal,
  XIcon,
} from "lucide-react-native";
import RideItem from "@/components/common/ride-item";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/common/text";
import RideFilters from "@/components/common/ride-filter";
import Direction from "../../../public/direction.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { Rides, SearchRideRequest } from "@/types/ride-types";
import { rideAlert, searchRide } from "@/service/ride-booking";
import { useRoute } from "@react-navigation/native";
import { useSearchRideStore } from "@/store/useSearchRideStore";

function Ride() {
  const loaded = useLoadFonts();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<{
    sortOption: number;
    numberOfStops: string;
    verifiedProfile: boolean;
    aminities:Record<string, boolean>
  }>();
  const [notify, setNotify] = useState(false);
  const [email, setEmail] = useState("");
  const [rides, setRides] = useState<Rides[]>([]);

  const { from_lat_long, to_lat_long, from, to } = useSearchRideStore();
  const route = useRoute();


  console.log(filter,"====================filter")

  const handleSearch = async () => {
    const requestData: SearchRideRequest = {
      user_lat: from_lat_long.lat,
      user_lng: from_lat_long.lon,
      destination_lat: to_lat_long.lat,
      destination_lng: to_lat_long.lon,
      date: route.params?.date,
      passengers: route.params?.passengers, 
      max_walking_distance_km: 10,
      "sort_by":filter?.sortOption || 1,
      "stops_filter":filter?.numberOfStops || "",
      verified_drivers_only:filter?.verifiedProfile || false,
      ...filter?.aminities,
    };

    console.log(requestData,"========================requestDtaa")

    try {
      const response = await searchRide(requestData);
      if (response?.data?.rides?.length) {
        setRides(response.data.rides);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleAlert = async () => {
    const request = {
      email: email,
      ride_id: rides[0]?.rideId
    }
    const response = await rideAlert(request)
    if (response) {
      setNotify(true);
      setModalVisible(false);
    }
  }

  useEffect(() => {
    handleSearch();
  }, [filter]);

  if (!loaded) return null;

  const renderRideItem = ({ item, index }: { item: Rides; index: number }) => (
    <RideItem passengers={route.params?.passengers} ride={item} key={`${index}-rideitem`} />
  );

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        contentContainerStyle={{
          paddingTop: 80,
          paddingBottom: 100,
          paddingHorizontal: 24,
          gap: 18,
        }}
        ListHeaderComponent={
          <>
            {/* Filter Button */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text
                  fontSize={16}
                  className="text-[#263238] font-[Kanit-Bold] truncate"
                  numberOfLines={1}
                >
                  {t(`${from},${to}`)}
                </Text>
                <Text fontSize={14} className="text-[#666666] font-[Kanit-Light]">
                  {t(`Today ${route.params?.passengers} Passengers`)}
                </Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center gap-[4px] px-[11px] py-[5px] rounded-full border border-[#FFBDBD]"
                onPress={() => setFilterVisible(true)}
              >
                <SlidersHorizontal size={16} />
                <Text fontSize={15} className="text-[#263238] font-[Kanit-Regular]">
                  {t("booking.ride.filters")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Today Section */}
            <Text fontSize={22} className="font-[Kanit-Regular] pt-4">
              {t("booking.ride.today")}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text>{t("booking.ride.noRides")}</Text>
          </View>
        }
      />

      {/* Alert Button / Confirmation */}
      <View className="absolute bottom-5 left-6 right-6">
        {!notify ? (
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full h-[55px] justify-center items-center w-full"
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text fontSize={20} className="text-white font-[Kanit-Regular]">
              {t("booking.ride.createAlert")}
            </Text>
          </TouchableOpacity>
        ) : (
          <Pressable className="bg-[#2DA771] rounded-full h-[55px] flex-row items-center justify-center gap-[14px]">
            <Text fontSize={20} className="text-white font-[Kanit-Regular]">
              {t("booking.ride.rideAlert")}
            </Text>
            <Check size={20} stroke="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <RideFilters close={(filters) => {
          setFilterVisible(false)
          setFilter(filters)
        }} />
      </Modal>

      {/* Email Alert Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-6 pt-10 pb-16">
            <TouchableOpacity
              className="ml-auto mb-4"
              onPress={() => setModalVisible(false)}
            >
              <XIcon color="#666666" size={20} />
            </TouchableOpacity>

            <Text fontSize={25} className="text-center font-[Kanit-Regular] mb-5">
              {t("booking.ride.enterEmail")}
            </Text>

            <View className="flex-row items-start gap-4 mb-4">
              <Direction width={32} height={32} />
              <View>
                <Text fontSize={13} className="text-[#939393] font-[Kanit-Light]">
                  {t("booking.ride.pickup")}
                </Text>
                <Text fontSize={15} className="font-[Kanit-Regular] mb-2">
                  {from}
                </Text>
                <Text fontSize={13} className="text-[#939393] font-[Kanit-Light]">
                  {t("booking.ride.drop")}
                </Text>
                <Text fontSize={15} className="font-[Kanit-Regular]">
                  {to}
                </Text>
              </View>
            </View>

            <View className="border-t border-dashed border-[#CDCDCD] my-4" />

            <Text fontSize={16} className="text-[#666666] font-[Kanit-Light] text-center mb-4">
              {t("booking.ride.emailInstruction")}
            </Text>

            <TextInput
              className="bg-[#F1F1F5] rounded-full h-[55px] text-[18px] font-[Kanit-Light] text-[#000] px-6 mb-5"
              placeholder={t("booking.ride.emailPlaceholder")}
              placeholderTextColor="#757478"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              onPress={handleAlert}
              className="bg-[#FF4848] rounded-full h-[54px] justify-center items-center self-center w-[229px]"
            >
              <Text fontSize={20} className="text-white font-[Kanit-Regular]">
                {t("booking.ride.createAlert")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Ride;