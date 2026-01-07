import LocationSearch from "@/components/common/location-search";
import Text from "@/components/common/text";
import Dialog from "@/components/ui/dialog";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCreateRideStore } from "@/store/useRideStore";
import { LocationData, UserStatusResp } from "@/types/ride-types";
import { getUserStatus } from "@/service/auth";
import { useFocusEffect } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { CheckCircle, Circle, AlertCircle } from "lucide-react-native";

function Pickup() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { setIsPublish, setPath } = useStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatusResp['data'] | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [setupSteps, setSetupSteps] = useState<any[]>([]);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  // Check login status immediately on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const stored = await useAsyncStorage("userDetails").getItem();
        const userDetails = stored ? JSON.parse(stored) : null;
        
        if (!userDetails || userDetails.type !== "login") {
          // User not logged in - redirect to login immediately
          setIsPublish(true);
          router.push('/login');
          return;
        }
        
        // User is logged in, allow component to render
        setIsCheckingLogin(false);
      } catch (error) {
        console.log('Login check failed:', error);
        // On error, redirect to login
        setIsPublish(true);
        router.push('/login');
      }
    };

    checkLoginStatus();
  }, []);

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const checkUserSetupStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const stored = await useAsyncStorage("userDetails").getItem();
      const userDetails = stored ? JSON.parse(stored) : null;
      
      if (userDetails?.type === "login") {
        const json: UserStatusResp = await getUserStatus();
        console.log('User Status API Response:', JSON.stringify(json, null, 2));
        setUserStatus(json.data);
        
        // Pass the fresh user status data directly to getSetupSteps
        const steps = await getSetupSteps(json.data);
        console.log('Setup Steps:', JSON.stringify(steps, null, 2));
        setSetupSteps(steps);
        
        // Check if any setup steps are incomplete
        const needsSetup = steps.some(step => step.required && !step.completed);
        
        if (needsSetup) {
          setShowSetupDialog(true);
        }
      }
    } catch (e) {
      console.log('Setup status check failed', e);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Only proceed if user is logged in (login check passed)
      if (!isCheckingLogin) {
        // Reset location selection when screen is focused
        setSelectedLocation(null);
        // Check setup status every time user enters the screen
        checkUserSetupStatus();
      }
    }, [isCheckingLogin])
  )


  const handleBookNow = async () => {
    setIsPublish(true);
    if (!selectedLocation) {
      showError(t("pickup.messages.locationRequired"));
      return;
    }

    // If setup dialog is showing, show it again instead of proceeding
    if (showSetupDialog) {
      return;
    }

    // All requirements should be met at this point, proceed with publish flow
    router.push("/(publish)/pickup-selected");
  };

  const handleSetupStep = async (step: string) => {
    setShowSetupDialog(false);
    setIsPublish(true);
    
    switch (step) {
      case 'bank':
        router.push('/bank-save');
        break;
      case 'verification':
        if (userStatus?.id_verification?.status === "pending") {
          router.push('/pending-verification');
        } else {
          router.push('/(publish)/upload-document');
        }
        break;
      case 'vehicle':
        setPath("/(tabs)/pickup");
        router.push('/add-vehicles');
        break;
      default:
        break;
    }
  };

  const getSetupSteps = async (currentUserStatus?: UserStatusResp['data'] | null) => {
    try {
      const stored = await useAsyncStorage("userDetails").getItem();
      const userDetails = stored ? JSON.parse(stored) : null;
      
      // Only return steps for logged-in users
      if (!userDetails || userDetails.type !== "login") {
        return [];
      }

      // Use the passed userStatus or fall back to state
      const statusToUse = currentUserStatus || userStatus;

      const steps = [
        {
          id: 'bank',
          title: t("pickup.setupDialog.steps.bank"),
          completed: statusToUse?.bank_details?.has_bank_details || false,
          required: true
        },
        {
          id: 'verification',
          title: t("pickup.setupDialog.steps.verification"),
          completed: statusToUse?.id_verification?.completed || false,
          required: true,
          status: statusToUse?.id_verification?.status
        }
      ];

      // Add vehicle step only for drivers
      if (statusToUse?.account?.is_driver) {
        steps.push({
          id: 'vehicle',
          title: t("pickup.setupDialog.steps.vehicle"),
          completed: statusToUse?.vehicles?.has_vehicles || false,
          required: true
        });
      }

      return steps;
    } catch (error) {
      console.log('Error getting setup steps:', error);
      return [];
    }
  };

  const hasIncompleteSteps = setupSteps.some(step => step.required && !step.completed);

  const renderSetupStep = (step: any, index: number) => {
    // Check if this step should be disabled
    const isStepDisabled = () => {
      // Disable completed steps
      if (step.completed) return true;
      
      // For steps after the first one, check if previous steps are completed
      if (index > 0) {
        const previousSteps = setupSteps.slice(0, index);
        return previousSteps.some(prevStep => prevStep.required && !prevStep.completed);
      }
      
      return false;
    };

    const disabled = isStepDisabled();

    return (
      <TouchableOpacity
        key={step.id}
        onPress={disabled ? undefined : () => handleSetupStep(step.id)}
        className={`flex-row items-center p-4 rounded-lg mb-3 ${
          disabled ? 'bg-gray-200' : 'bg-gray-50'
        }`}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View className="mr-3">
          {step.completed ? (
            <CheckCircle color="#10B981" size={24} />
          ) : (
            <Circle color={disabled ? "#D1D5DB" : "#6B7280"} size={24} />
          )}
        </View>
        <View className="flex-1">
          <Text className={`text-[16px] font-[Kanit-Medium] ${
            disabled ? 'text-gray-400' : 'text-gray-900'
          }`}>
            {step.title}
          </Text>
          {step.status === 'pending' && (
            <Text className="text-[14px] font-[Kanit-Light] text-orange-600">
              {t("pickup.setupDialog.status.pending")}
            </Text>
          )}
          {step.completed && (
            <Text className="text-[14px] font-[Kanit-Light] text-green-600">
              {t("pickup.setupDialog.status.completed")}
            </Text>
          )}
        </View>
        {!step.completed && !disabled && (
          <Text className="text-[14px] font-[Kanit-Regular] text-[#FF4848]">
            {t("pickup.setupDialog.buttons.setup")}
          </Text>
        )}
        {disabled && !step.completed && (
          <Text className="text-[14px] font-[Kanit-Regular] text-gray-400">
            {t("pickup.setupDialog.buttons.locked", "Locked")}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleLocationSelect = (value: LocationData) => {
    setSelectedLocation(value);
    setRideField("pickup_address", value?.mainText);
    setRideField("pickup_lat", value?.lat);
    setRideField("pickup_lng", value?.lng);
    console.log(value, "pickup");
  };

  const isFormValid = () => {
    return selectedLocation && selectedLocation.text && selectedLocation.text.trim().length > 0 && !hasIncompleteSteps;
  };

  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore();

  // Don't render anything while checking login status
  if (!loaded || isCheckingLogin) return null;
  
  return (
    <>
      <ScrollView 
        bounces={false} 
        className="w-full px-6 pt-10 pb-12 bg-white"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustsScrollIndicatorInsets={false}
        keyboardShouldPersistTaps="handled"
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
          {t("pickup.messages.selectLocation")}
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
        
        {!selectedLocation && (
          <Text
            fontSize={14}
            className="text-[14px] text-[#666666] font-[Kanit-Light] text-center -mt-6 mb-4"
          >
            {t("pickup.messages.locationRequired")}
          </Text>
        )}
        
        {selectedLocation && hasIncompleteSteps && (
          <Text
             onPress={()=>setShowSetupDialog(true)}
            fontSize={14}
            className="text-[14px] text-[#FF4848] font-[Kanit-Light] text-center -mt-6 mb-4"
          >
            {t("pickup.messages.setupRequired")}
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

      {/* Setup Progress Dialog */}
      <Dialog
        visible={showSetupDialog}
        onClose={() => setShowSetupDialog(false)}
        title={t("pickup.setupDialog.title")}
        showButtons={false}
        closeOnBackdrop={false}
      >
        <View className="mb-4">
          <View className="flex-row items-center mb-4 p-3 bg-blue-50 rounded-lg">
            <AlertCircle color="#3B82F6" size={20} />
            <Text className="text-[14px] font-[Kanit-Regular] text-blue-800 ml-2 flex-1">
              {t("pickup.setupDialog.subtitle")}
            </Text>
          </View>
          
          {setupSteps.map((step, index) => renderSetupStep(step, index))}
          
          <TouchableOpacity
            onPress={() => setShowSetupDialog(false)}
            className="mt-4 h-[50px] rounded-full border border-gray-300 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-[16px] font-[Kanit-Regular] text-gray-700">
              {t("pickup.setupDialog.buttons.later")}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    </>
  );
}

export default Pickup;
