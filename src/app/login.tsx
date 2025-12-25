import Text from "@/components/common/text";
import PhoneInput from "@/components/inputs/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import AlertDialog from "@/components/ui/alert-dialog";
import {
  Dimensions,
  Image,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import VerifyOtp from "@/components/login/verify-otp";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";

const { height } = Dimensions.get("window");

function Login() {
  
  const { t } = useTranslation()
  const { isRTL, swap } = useDirection()
  const router = useRouter()
  const [phoneNumber,setPhoneNumber]=useState<string>("")
  const [isChecked,setIsChecked] = useState(false)
  const [phoneError, setPhoneError] = useState<string>("")
  const [errorDialog, setErrorDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "error",
  });

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 8) {
      setPhoneError(t("login.phone_min_digits"));
      return false;
    }
    
    if (digitsOnly.length > 15) {
      setPhoneError(t("login.phone_max_digits"));
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (phone: string, countryCode: string) => {
    const cleanPhone = phone?.startsWith("0") ? phone.slice(1) : phone;
    setPhoneNumber(cleanPhone);
    
    // Validate phone number on change
    if (cleanPhone) {
      validatePhoneNumber(cleanPhone);
    } else {
      setPhoneError("");
    }
  };

  const showError = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "error") => {
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

  // Check if form is valid
  const isFormValid = isChecked && phoneNumber.trim().length > 0 && !phoneError;

  const handleBack = () => {
    router.replace("/(tabs)/book");
  };

  return (
    <KeyboardAwareScrollView 
      style={{ flex: 1,backgroundColor:'white' }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === "ios" ? 30 : 50}
      extraHeight={Platform.OS === "ios" ? 150 : 180}
      bounces={true}
    >
      {/* Back Button */}
      <View className={cn("absolute top-12 z-10", isRTL ? "right-6" : "left-6")}>
        <TouchableOpacity
          className="bg-white rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
          activeOpacity={0.8}
          onPress={handleBack}
        >
          {swap(<ChevronLeft color="#3C3F4E" />, <ChevronRight color="#3C3F4E" />)}
        </TouchableOpacity>
      </View>

      <Image
        style={{ height: height / 2.5 }}
        className="object-cover w-full"
        source={require(`../../public/login.png`)}
        alt=""
      />
      <View className="flex flex-col items-center justify-start p-5 w-full rounded-t-2xl -mt-[60px] bg-white min-h-[400px]">
        <View className="max-w-[420px] w-full pt-4 pb-10">
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] text-start leading-tight tracking-tight mb-6 flex-1"
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {t("login.verify_phone_number")}
          </Text>
          <PhoneInput
            label={t("mobile_number", { ns: "components" })}
            defaultCountryCode="SA"
            className="mb-7"
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={phoneError}
          />
          <View className={cn("flex flex-row gap-4 mb-7", isRTL && "flex-row-reverse")}>
            <Checkbox
              onValueChange={(isChecked)=>setIsChecked(isChecked)}
              className="mt-0.5 border-[#EBEBEB] rounded-[1px] cursor-pointer"
              checked={isChecked}
            />
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light] cursor-pointer leading-tight tracking-tight flex-1"
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            >
              {t("login.no_special_offers")}
            </Text>
          </View>
          <Text
            fontSize={12}
            className="text-[12px] text-[#666666] font-[Kanit-Light] tracking-tight mb-8 flex-1"
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {t("login.agreement_text")}
          </Text>
          <VerifyOtp 
            phoneNumber={phoneNumber!} 
            disabled={!isFormValid} 
            onError={showError}
          />
        </View>
      </View>

      {/* Error Dialog */}
      <AlertDialog
        visible={errorDialog.visible}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        type={errorDialog.type}
        confirmText={t("components.common.ok")}
      />
    </KeyboardAwareScrollView>
  );
}

export default Login;
