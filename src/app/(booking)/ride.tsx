import {
  Check,
  SlidersHorizontal,
  XIcon,
  ChevronLeft,
  ChevronRight,
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
import AlertDialog from "@/components/ui/alert-dialog";

function Ride() {
  const loaded = useLoadFonts();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();

  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<{
    sortOption: number;
    numberOfStops: string;
    verifiedProfile: boolean;
    amenities: Record<string, boolean>;
  }>();
  const [notify, setNotify] = useState(false);
  const [email, setEmail] = useState("");
  const [rides, setRides] = useState<Rides[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const { from_lat_long, to_lat_long, from, to } = useSearchRideStore();
  const route = useRoute();
  const routeParams = route.params as { date: string; passengers: number } | undefined;


  console.log(filter,"====================filter")

  const showErrorDialog = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "error") => {
    setErrorDialog({
      visible: true,
      title,
      message,
      type,
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      ...errorDialog,
      visible: false,
    });
  };

  const handleSearch = async () => {
    const requestData: SearchRideRequest = {
      user_lat: from_lat_long.lat,
      user_lng: from_lat_long.lon,
      destination_lat: to_lat_long.lat,
      destination_lng: to_lat_long.lon,
      date: routeParams?.date || "",
      passengers: routeParams?.passengers || 1, 
      max_walking_distance_km: 10,
      sort_by: filter?.sortOption || 1,
      stops_filter: filter?.numberOfStops || "direct_only",
      verified_drivers_only: filter?.verifiedProfile || false,
      // Spread amenities with default values
      max_2_in_back: filter?.amenities?.max_2_in_back || false,
      instant_booking: filter?.amenities?.instant_booking || false,
      smoking_allowed: filter?.amenities?.smoking_allowed || false,
      pets_allowed: filter?.amenities?.pets_allowed || false,
      power_outlets: filter?.amenities?.power_outlets || false,
      air_conditioning: filter?.amenities?.air_conditioning || false,
      accessible_for_disabled: filter?.amenities?.accessible_for_disabled || false,
    };

    console.log(requestData,"========================requestData")

    setLoading(true);
    try {
      const response = await searchRide(requestData);
      if (response?.data?.rides?.length) {
        setRides(response.data.rides);
      } else {
        setRides([]);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      
      // Extract meaningful error message
      const errorMessage = 
        err?.response?.data?.message ||
        err?.message ||
        err?.errors?.date?.[0] ||
        err?.errors?.passengers?.[0] ||
        "Failed to search rides. Please check your connection and try again.";
      
      showErrorDialog(
        "Search Failed",
        errorMessage,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = async () => {
    // Validate email
    if (!email.trim()) {
      showErrorDialog(
        "Email Required",
        "Please enter your email address to create an alert.",
        "warning"
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showErrorDialog(
        "Invalid Email",
        "Please enter a valid email address.",
        "warning"
      );
      return;
    }

    if (!rides.length) {
      showErrorDialog(
        "No Rides Available",
        "Cannot create alert as no rides are available for this route.",
        "warning"
      );
      return;
    }

    const request = {
      email: email.trim(),
      ride_id: rides[0]?.rideId
    };

    setAlertLoading(true);
    try {
      const response = await rideAlert(request);
      if (response?.data || response?.success) {
        setNotify(true);
        setModalVisible(false);
        setEmail(""); // Clear email after success
        
        showErrorDialog(
          "Alert Created",
          "You'll be notified when new rides matching your criteria become available.",
          "success"
        );
      } else {
        throw new Error("Failed to create alert");
      }
    } catch (err: any) {
      console.error("Alert creation failed:", err);
      
      // Extract meaningful error message
      const errorMessage = 
        err?.response?.data?.message ||
        err?.message ||
        err?.errors?.email?.[0] ||
        err?.errors?.ride_id?.[0] ||
        "Failed to create ride alert. Please try again.";
      
      showErrorDialog(
        "Alert Failed",
        errorMessage,
        "error"
      );
    } finally {
      setAlertLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filter]);

  if (!loaded) return null;

  const renderRideItem = ({ item, index }: { item: Rides; index: number }) => (
    <RideItem passengers={String(routeParams?.passengers || 1)} ride={item} key={`${index}-rideitem`} />
  );

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item, index) => String(item.rideId ?? index)}
        contentContainerStyle={{
          paddingTop: 80,
          paddingBottom: 100,
          paddingHorizontal: 24,
          gap: 18,
        }}
        ListHeaderComponent={
          <>
            {/* Back Button and Header */}
            <View className="flex-row items-center gap-4 mb-6">
              <TouchableOpacity
                className="rounded-full size-[46px] border border-[#EBEBEB] bg-white items-center justify-center"
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                {swap(<ChevronLeft size={24} />, <ChevronRight size={24} />)}
              </TouchableOpacity>
              <Text fontSize={23} className="text-[23px] font-[Kanit-Medium] flex-1">
                {t("booking.ride.title")}
              </Text>
            </View>

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
                  {t("booking.ride.today")} • {routeParams?.passengers} {t("booking.ride.passengers")}
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
            {loading ? (
              <Text className="text-[#666666] font-[Kanit-Light]">
                {t("booking.ride.searching")}
              </Text>
            ) : (
              <View className="items-center">
                <Text className="text-[#666666] font-[Kanit-Regular] mb-2">
                  {t("booking.ride.noRides")}
                </Text>
                <Text className="text-[#999999] font-[Kanit-Light] text-center px-4">
                  Try adjusting your filters or create an alert to be notified when rides become available.
                </Text>
              </View>
            )}
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
        <RideFilters 
          close={(filters) => {
            setFilterVisible(false)
            setFilter(filters)
            console.log(filters,"filters==================")
          }} 
          onDismiss={() => setFilterVisible(false)}
        />
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
              disabled={alertLoading}
              className={`${alertLoading ? 'bg-[#FF4848]/50' : 'bg-[#FF4848]'} rounded-full h-[54px] justify-center items-center self-center w-[229px]`}
            >
              <Text fontSize={20} className="text-white font-[Kanit-Regular]">
                {alertLoading ? t("booking.ride.creating") : t("booking.ride.createAlert")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Error Dialog */}
      <AlertDialog
        visible={errorDialog.visible}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        type={errorDialog.type}
        confirmText="OK"
      />
    </View>
  );
}

export default Ride;