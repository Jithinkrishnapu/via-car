import LocationSearch from "@/components/common/location-search";
import Text from "@/components/common/text";
import Dialog from "@/components/ui/dialog";
import Snackbar from "@/components/ui/snackbar";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useNetworkError } from "@/hooks/use-network-error";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCreateRideStore } from "@/store/useRideStore";
import { LocationData, UserStatusResp } from "@/types/ride-types";
import { getUserStatus } from "@/service/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

function Pickup() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { setIsPublish, setPath } = useStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const { showSnackbar, snackbarMessage, showNetworkError, hideSnackbar, setRetryAction } = useNetworkError();

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  async function enforceProfileCompleteness() {
    try {
      const json: UserStatusResp = await getUserStatus();
      const d = json.data;

      // Set publish mode since user is trying to publish a ride
      setIsPublish(true);
      
      const stored = await useAsyncStorage("userDetails").getItem();
      const userDetails = stored ? JSON.parse(stored) : null;
      
      if (userDetails?.type === "login") {
        // Check profile completeness for publish users
        if (!d?.bank_details?.has_bank_details) {
          router.push('/bank-save');
          return;
        }
        
        /* Identity verification check */
        if (!d?.id_verification?.completed) {
          if (d?.id_verification?.status === "pending") {
            router.push('/pending-verification');
          } else {
            router.push('/(publish)/upload-document');
          }
          return;
        }

        /* Vehicle requirement for drivers */
        if (d?.account?.is_driver && !d?.vehicles?.has_vehicles) {
          setPath("/(tabs)/pickup");
          router.push('/add-vehicles');
          return;
        }
        
        // All requirements met, user can proceed with publish flow
        // Stay on pickup screen
      } else {
        // User not logged in, redirect to login
        router.push('/login');
      }

    } catch (e) {
      console.log('Status check failed', e);
      showNetworkError('Failed to verify profile status. Please check your connection and try again.');
      setRetryAction(() => enforceProfileCompleteness);
    }
  }

  useFocusEffect(
    useCallback(() => {
      // Reset location selection when screen is focused
      setSelectedLocation(null);
      // Then enforce profile completeness
      enforceProfileCompleteness();
    }, [])
  )


  const handleBookNow = async () => {
    if (!selectedLocation) {
      showError('Please select a pickup location to continue.');
      return;
    }
    router.push("/(publish)/pickup-selected");
  };

  const handleLocationSelect = (value: LocationData) => {
    setSelectedLocation(value);
    setRideField("pickup_address", value?.text);
    setRideField("pickup_lat", value?.lat);
    setRideField("pickup_lng", value?.lng);
    console.log(value, "pickup");
  };

  const isFormValid = () => {
    return selectedLocation && selectedLocation.text && selectedLocation.text.trim().length > 0;
  };

  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore();

  if (!loaded) return null;
  
  return (
    <>
      <ScrollView 
        bounces={false} 
        className="w-full px-6 pt-8 pb-12 bg-white"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustsScrollIndicatorInsets={false}
      >
        <Text
          fontSize={25}
          className="text-[25px] text-[#0A2033] font-[Kanit-Medium] w-full mx-auto leading-tight mb-[33px]"
        >
          {t("pickup.title")}
        </Text>
        
        <Text
          fontSize={16}
          className="text-[16px] text-[#666666] font-[Kanit-Light] mb-4"
        >
          Select your pickup location to continue
        </Text>
        
        <LocationSearch onSelect={handleLocationSelect} />
        <TouchableOpacity
          className={`rounded-full w-full h-[55px] my-[33px] cursor-pointer items-center justify-center transition-colors ${
            isFormValid() ? 'bg-[#FF4848]' : 'bg-gray-400'
          }`}
          onPress={handleBookNow}
          disabled={!isFormValid()}
          activeOpacity={isFormValid() ? 0.8 : 1}
        >
          <Text
            fontSize={19}
            className={`text-[19px] font-[Kanit-Light] ${
              isFormValid() ? 'text-white' : 'text-gray-600'
            }`}
          >
            {t("common.continue")}
          </Text>
        </TouchableOpacity>
        
        {!isFormValid() && (
          <Text
            fontSize={14}
            className="text-[14px] text-[#666666] font-[Kanit-Light] text-center -mt-6 mb-4"
          >
            Please select a pickup location to continue
          </Text>
        )}
      </ScrollView>

      {/* Error Dialog */}
      <Dialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Profile Verification"
        showButtons={true}
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {errorMessage}
        </Text>
      </Dialog>

      {/* Network Error Snackbar */}
      <Snackbar
        visible={showSnackbar}
        message={snackbarMessage}
        type="error"
        onDismiss={hideSnackbar}
        duration={5000}
      />
    </>
  );
}

export default Pickup;
