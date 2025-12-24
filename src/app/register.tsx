import Text from "@/components/common/text";
import {
  Alert,
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
import { useState } from "react";
import { getUserStatus, handleRegister } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useStore } from "@/store/useStore";
import { UserStatusResp } from "@/types/ride-types";

const { height } = Dimensions.get("window");

function Register() {
  const { t } = useTranslation("index");
  const { isPublish } = useStore();
  const [category, setCategory] = useState<string>('');
  const [dob, setDob] = useState('');
  const [formattedDob, setFormattedDob] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: ''
  });

  const categories = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
    { label: 'Other', value: '3' },
  ];

  const handleDateChange = (date: Date, formattedDate: string) => {
    setDob(date.toISOString().split('T')[0]);
    setFormattedDob(formattedDate);

    const age = new Date().getFullYear() - date.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old.');
      setFieldErrors(prev => ({ ...prev, dob: 'You must be at least 18 years old.' }));
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
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
      errors.firstName = 'First name can only contain letters';
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lastName.trim())) {
      errors.lastName = 'Last name can only contain letters';
      isValid = false;
    }

    // Validate date of birth
    if (!dob) {
      errors.dob = 'Date of birth is required';
      isValid = false;
    } else {
      const age = new Date().getFullYear() - new Date(dob).getFullYear();
      if (age < 18) {
        errors.dob = 'You must be at least 18 years old';
        isValid = false;
      }
    }

    // Validate gender
    if (!category) {
      errors.gender = 'Gender selection is required';
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
      setErrorMessage('Please fill in all required fields correctly.');
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const otpId = await useAsyncStorage("otp_id").getItem();
      
      if (!otpId) {
        setErrorMessage('Session expired. Please try logging in again.');
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
          if (isPublish) {
            // User came from publish flow, enforce profile completeness
            enforceProfileCompleteness();
          } else {
            // Normal user registration, go to book tab
            router.replace(`/(tabs)/book`);
          }
        } else {
          setErrorMessage(response?.message || 'Registration failed. Please try again.');
          setShowErrorDialog(true);
        }
      } else {
        setErrorMessage('Registration failed. Please try again.');
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.log("Registration error:", error);
      setErrorMessage(
        error?.message || 
        'Registration failed. Please check your connection and try again.'
      );
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        bounces={false}
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          style={{ height: height / 2 }}
          className="object-cover w-full"
          source={require(`../../public/login.png`)}
          alt=""
        />
        <View className="flex flex-col items-center justify-start p-5 w-full overflow-y-auto rounded-t-2xl -mt-[60px] bg-white">
          <View className="max-w-[420px] w-full pt-4 lg:pt-20 pb-10">
            <Text
              fontSize={25}
              className="text-[25px] font-[Kanit-Medium] text-start leading-tight tracking-tight mb-6 flex-1"
            >
              {t("verify_phone_number")}
            </Text>

            <InputComponent
              label="First Name"
              placeHolder="first name"
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
              label="Last Name"
              placeHolder="last name"
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
              label="Select Gender"
              items={categories}
              selectedValue={category}
              onValueChange={(value) => {
                setCategory(String(value));
                if (fieldErrors.gender) {
                  setFieldErrors(prev => ({ ...prev, gender: '' }));
                }
              }}
              placeholder="Choose your gender"
              style="w-full"
              error={fieldErrors.gender}
            />
            <TouchableOpacity
              onPress={handleRegistration}
              disabled={!isFormValid() || isLoading}
              className={`flex items-center rounded-full w-full h-[54px] cursor-pointer mb-5 ${
                !isFormValid() || isLoading 
                  ? 'bg-gray-400' 
                  : 'bg-[#FF4848]'
              }`}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
              ) : (
                <Text
                  fontSize={20}
                  className="my-auto text-[20px] text-white font-[Kanit-Regular]"
                >
                  {t("Verify")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Error Dialog */}
      <Dialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Registration Error"
        showButtons={true}
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {errorMessage}
        </Text>
      </Dialog>
    </KeyboardAvoidingView>
  );
}

export default Register;