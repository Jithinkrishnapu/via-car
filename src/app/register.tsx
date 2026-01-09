import Text from "@/components/common/text";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { InputComponent } from "@/components/inputs/common-input";
import CustomPicker from "@/components/common/dropdown-component";
import DobPicker from "@/components/common/dob-calander";
import Dialog from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { getUserStatus, handleRegister } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useStore } from "@/store/useStore";
import { UserStatusResp } from "@/types/ride-types";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get("window");

function Register() {
  const { t } = useTranslation();
  const { isPublish } = useStore();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<string>('');
  const [dob, setDob] = useState('');
  const [formattedDob, setFormattedDob] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: ''
  });

  // Update dimensions on screen rotation
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { height, width } = screenDimensions;
  const isSmallScreen = height < 700;
  const isTablet = width > 768;

  const categories = [
    { label: t('male'), value: '1' },
    { label: t('female'), value: '2' },
    { label: t('other'), value: '3' },
  ];

  const handleDateChange = (date: Date, formattedDate: string) => {
    setDob(date.toISOString().split('T')[0]);
    setFormattedDob(formattedDate);

    const age = new Date().getFullYear() - date.getFullYear();
    if (age < 18) {
      setError(t('ageMinimum'));
      setFieldErrors(prev => ({ ...prev, dob: t('ageMinimum') }));
    } else {
      setError('');
      setFieldErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  const validateForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      dob: '',
      gender: ''
    };

    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      errors.firstName = t('firstNameRequired');
      isValid = false;
    } else if (firstName.trim().length < 2) {
      errors.firstName = t('firstNameMinLength');
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
      errors.firstName = t('firstNameLettersOnly');
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      errors.lastName = t('lastNameRequired');
      isValid = false;
    } else if (lastName.trim().length < 2) {
      errors.lastName = t('lastNameMinLength');
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lastName.trim())) {
      errors.lastName = t('lastNameLettersOnly');
      isValid = false;
    }

    // Validate date of birth
    if (!dob) {
      errors.dob = t('dobRequired');
      isValid = false;
    } else {
      const age = new Date().getFullYear() - new Date(dob).getFullYear();
      if (age < 18) {
        errors.dob = t('ageMinimum');
        isValid = false;
      }
    }

    // Validate gender
    if (!category) {
      errors.gender = t('genderRequired');
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const isFormValid = () => {
    return firstName.trim() && 
           lastName.trim() && 
           dob && 
           category && 
           !error &&
           Object.values(fieldErrors).every(err => !err);
  };

  async function enforceProfileCompleteness() {
    try {
      const json: UserStatusResp = await getUserStatus();
      const d = json.data;

      // Check if user needs to complete publish flow
      if (!d.bank_details.has_bank_details) {
        router.replace('/bank-save');
        return;
      }

      if (!d.id_verification.completed) {
        if (d.id_verification.status === "pending") {
          router.replace('/pending-verification');
        } else {
          router.replace('/(publish)/upload-document');
        }
        return;
      }

      if (d.account.is_driver && !d.vehicles.has_vehicles) {
        router.replace('/add-vehicles');
        return;
      }

      // All requirements met, go to pickup
      router.replace('/(tabs)/pickup');
    } catch (e) {
      console.log('Status check failed', e);
      // On error, go to book tab as fallback
      router.replace('/(tabs)/book');
    }
  }

  const handleRegistration = async () => {
    if (!validateForm()) {
      setErrorMessage(t('fillAllFields'));
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const otpId = await useAsyncStorage("otp_id").getItem();
      
      if (!otpId) {
        setErrorMessage(t('sessionExpired'));
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }

      const formdata = new FormData();
      formdata.append("otp_id", otpId);
      formdata.append("device_type", "1");
      formdata.append("first_name", firstName.trim());
      formdata.append("last_name", lastName.trim());
      formdata.append("date_of_birth", dob);
      formdata.append("gender", category);
      formdata.append("fcm_token", "test");


      console.log(formdata,"=========================",isPublish)

      const response = await handleRegister(formdata);
      
      if (response) {
        if (response?.data?.type === "login") {
          await useAsyncStorage('userDetails').setItem(JSON.stringify(response?.data));
          
          // Check for pending booking after successful registration
          const pendingBookingData = await useAsyncStorage("pendingBooking").getItem();
          if (pendingBookingData) {
            const bookingContext = JSON.parse(pendingBookingData);
            
            // Clear the pending booking data
            await useAsyncStorage("pendingBooking").removeItem();
            
            // Redirect back to ride details to complete the booking
            if (bookingContext.returnTo === "booking" && bookingContext.rideId) {
              router.replace({
                pathname: "/(booking)/ride-details",
                params: {
                  rideId: bookingContext.rideId,
                  ride_amount_id: bookingContext.ride_amount_id,
                  passengers: bookingContext.passengers,
                  autoBook: "true" // Flag to automatically trigger booking
                }
              });
              return;
            }
          }
          
          if (isPublish) {
            // User came from publish flow, enforce profile completeness
            enforceProfileCompleteness();
          } else {
            // Normal user registration, go to book tab
            router.replace(`/(tabs)/book`);
          }
        } else {
          setErrorMessage(response?.message || t('registrationFailed'));
          setShowErrorDialog(true);
        }
      } else {
        setErrorMessage(t('registrationFailed'));
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.log("Registration error:", error);
      setErrorMessage(
        error?.message || t('connectionError')
      );
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          bounces={false}
          className="flex-1 w-full bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={false}
          overScrollMode="never"
        >
          {/* Hero Image - Responsive height */}
          <View 
            className="relative w-full" 
            style={{ 
              height: isTablet 
                ? Math.min(height * 0.3, 300) 
                : isSmallScreen 
                  ? Math.min(height * 0.35, 280) 
                  : Math.min(height * 0.4, 350) 
            }}
          >
            <Image
              style={{ 
                height: isTablet 
                  ? Math.min(height * 0.3, 300) 
                  : isSmallScreen 
                    ? Math.min(height * 0.35, 280) 
                    : Math.min(height * 0.4, 350),
                width: '100%'
              }}
              className="object-cover"
              source={require(`../../public/login.png`)}
              alt=""
              resizeMode="cover"
            />
          </View>

          {/* Form Container - Responsive */}
          <View className={`flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 ${
            isTablet ? 'px-12' : 'px-4 sm:px-6'
          } ${isSmallScreen ? 'pt-4 pb-6' : 'pt-6 pb-8'}`}>
            <View className={`w-full mx-auto flex-1 ${
              isTablet ? 'max-w-lg' : 'max-w-md'
            }`}>
              {/* Title - Responsive text size */}
              <Text
                fontSize={isSmallScreen ? 20 : isTablet ? 28 : 25}
                className={`${
                  isSmallScreen ? 'text-[20px]' : isTablet ? 'text-[28px]' : 'text-[25px]'
                } font-[Kanit-Medium] text-center leading-tight tracking-tight ${
                  isSmallScreen ? 'mb-4' : 'mb-6'
                } text-gray-900`}
              >
                {t("verify_your_profile")}
              </Text>

              {/* Form Fields - Responsive spacing */}
              <View className={`flex-1 ${isSmallScreen ? 'space-y-3' : 'space-y-4'}`}>
                <InputComponent
                  label={t('firstName')}
                  placeHolder={t('firstNamePlaceholder')}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (fieldErrors.firstName) {
                      setFieldErrors(prev => ({ ...prev, firstName: '' }));
                    }
                  }}
                  value={firstName}
                  error={fieldErrors.firstName}
                />
                
                <InputComponent
                  label={t('lastName')}
                  placeHolder={t('lastNamePlaceholder')}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (fieldErrors.lastName) {
                      setFieldErrors(prev => ({ ...prev, lastName: '' }));
                    }
                  }}
                  value={lastName}
                  error={fieldErrors.lastName}
                />
                
                <DobPicker
                  onDateChange={handleDateChange}
                  errorMessage={error || fieldErrors.dob}
                  minimumAge={18}
                />
                
                <CustomPicker
                  label={t('selectGender')}
                  items={categories}
                  selectedValue={category}
                  onValueChange={(value) => {
                    setCategory(String(value));
                    if (fieldErrors.gender) {
                      setFieldErrors(prev => ({ ...prev, gender: '' }));
                    }
                  }}
                  placeholder={t('chooseGender')}
                  style="w-full"
                  error={fieldErrors.gender}
                />
              </View>

              {/* Submit Button - Responsive positioning */}
              <View className={`${isSmallScreen ? 'mt-6 pt-3' : 'mt-8 pt-4'}`} 
                   style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                <TouchableOpacity
                  onPress={handleRegistration}
                  disabled={!isFormValid() || isLoading}
                  className={`flex items-center justify-center rounded-full w-full ${
                    isSmallScreen ? 'h-12' : isTablet ? 'h-14' : 'h-[54px]'
                  } ${
                    !isFormValid() || isLoading 
                      ? 'bg-gray-400' 
                      : 'bg-[#FF4848]'
                  } shadow-lg`}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      fontSize={isSmallScreen ? 16 : isTablet ? 22 : 20}
                      className={`${
                        isSmallScreen ? 'text-[16px]' : isTablet ? 'text-[22px]' : 'text-[20px]'
                      } text-white font-[Kanit-Regular]`}
                    >
                      {t("Verify")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Error Dialog */}
        <Dialog
          visible={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          title={t('registrationError')}
          showButtons={true}
          confirmText={t('components.common.ok')}
          onConfirm={() => setShowErrorDialog(false)}
        >
          <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
            {errorMessage}
          </Text>
        </Dialog>
      </KeyboardAvoidingView>
    </View>
  );
}

export default Register;