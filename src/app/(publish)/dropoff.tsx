import LocationSearch from "@/components/common/location-search";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import Dialog from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { LocationData } from "@/types/ride-types";
import { useState } from "react";

function Dropoff() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const handleLocationSelect = (value: LocationData) => {
    setSelectedLocation(value);
    console.log(value, "dropoff");
    setRideField("destination_address", value?.text);
    setRideField("destination_lat", value?.lat);
    setRideField("destination_lng", value?.lng);
  };

  const handleContinue = () => {
    if (!selectedLocation) {
      showError('Please select a dropoff location to continue.');
      return;
    }
    router.push("/(publish)/dropoff-selected");
  };

  const isFormValid = () => {
    return selectedLocation && selectedLocation.text && selectedLocation.text.trim().length > 0;
  };

  if (!loaded) return null;
  return (
    <>
      <ScrollView 
        bounces={false} 
        className="px-6 pt-16 pb-12 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-4 mb-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.replace("..")}
            activeOpacity={0.8}
          >
            <ChevronLeft size={16} />
          </TouchableOpacity>
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] flex-1"
          >
            {t("dropoff.title")}
          </Text>
        </View>
        
        <Text
          fontSize={16}
          className="text-[16px] text-[#666666] font-[Kanit-Light] mb-4"
        >
          Select your dropoff location to continue
        </Text>
        
        <LocationSearch onSelect={handleLocationSelect} />
        
        <TouchableOpacity
          className={`rounded-full w-full h-[55px] my-[33px] cursor-pointer items-center justify-center transition-colors ${
            isFormValid() ? 'bg-[#FF4848]' : 'bg-gray-400'
          }`}
          onPress={handleContinue}
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
            Please select a dropoff location to continue
          </Text>
        )}
      </ScrollView>

      {/* Error Dialog */}
      <Dialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Location Required"
        showButtons={true}
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {errorMessage}
        </Text>
      </Dialog>
    </>
  );
}

export default Dropoff;
