import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import OtpAnimation from "../animated/otp-animation";
import { XIcon } from "lucide-react-native";
import { router } from "expo-router";
import Text from "../common/text";
import AlertDialog from "../ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { handleSendOtp, handleVerifyOtp } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { NotificationService } from "@/services/notificationService";
import { ApiError } from "@/utils/apiErrorHandler";

const { height } = Dimensions.get("window");

const VerifyOtp = ({ 
  phoneNumber, 
  disabled = false, 
  onError 
}: { 
  phoneNumber: string; 
  disabled?: boolean;
  onError?: (title: string, message: string, type?: "info" | "warning" | "error" | "success") => void;
}) => {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const translateY = useRef(new Animated.Value(height)).current;
  const refs = useRef<TextInput[]>([]);
  const [otpId, setOtpId] = useState("");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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

  const showError = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "error") => {
    if (onError) {
      onError(title, message, type);
    } else {
      setErrorDialog({
        visible: true,
        title,
        message,
        type,
      });
    }
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      ...errorDialog,
      visible: false,
    });
  };

  const getErrorMessage = (error: any): { title: string; message: string; type: "error" | "warning" } => {
    console.error("API Error:", error);
    
    // Handle API errors with status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            title: "Invalid Request",
            message: error.message || "Please check your input and try again.",
            type: "error"
          };
        case 401:
          return {
            title: "Authentication Error",
            message: "Invalid credentials. Please try again.",
            type: "error"
          };
        case 403:
          return {
            title: "Access Denied",
            message: "You do not have permission to perform this action.",
            type: "error"
          };
        case 404:
          return {
            title: "Service Not Found",
            message: "The service is temporarily unavailable. Please try again later.",
            type: "error"
          };
        case 422:
          return {
            title: "Validation Error",
            message: error.message || "Please check your input and try again.",
            type: "error"
          };
        case 429:
          return {
            title: "Too Many Requests",
            message: "Please wait a moment before trying again.",
            type: "warning"
          };
        case 500:
          return {
            title: "Server Error",
            message: "Something went wrong on our end. Please try again later.",
            type: "error"
          };
        case 502:
        case 503:
        case 504:
          return {
            title: "Service Unavailable",
            message: "The service is temporarily unavailable. Please try again later.",
            type: "error"
          };
        default:
          return {
            title: `Error ${error.status}`,
            message: error.message || "An unexpected error occurred.",
            type: "error"
          };
      }
    }
    
    // Handle network and other errors
    if (error.message) {
      if (error.message.includes('Network') || error.message.includes('network')) {
        return {
          title: "Connection Error",
          message: "Please check your internet connection and try again.",
          type: "error"
        };
      }
      
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return {
          title: "Timeout Error",
          message: "The request took too long. Please try again.",
          type: "error"
        };
      }
      
      if (error.message.includes('Invalid') || error.message.includes('OTP')) {
        return {
          title: "Invalid Code",
          message: "The verification code is invalid. Please check and try again.",
          type: "error"
        };
      }
      
      return {
        title: "Error",
        message: error.message,
        type: "error"
      };
    }
    
    // Default error
    return {
      title: "Unexpected Error",
      message: "Something went wrong. Please try again.",
      type: "error"
    };
  };

  // Keyboard listeners for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
        const keyboardHeight = e.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        
        // Animate the modal up when keyboard appears
        Animated.timing(translateY, {
          toValue: -keyboardHeight / 2,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
      
      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        
        // Animate the modal back to original position
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }
  }, [translateY]);

  // Get FCM token when component mounts
  useEffect(() => {
    const getFcmToken = async () => {
      try {
        // Request permissions first
        const permissionGranted = await NotificationService.requestPermissions();
        if (permissionGranted) {
          // Get Expo push token
          const token = await NotificationService.getExpoPushToken();
          setFcmToken(token);
          console.log('Expo Push Token for login:', token);
        } else {
          console.log('Notification permissions not granted');
          // Set a fallback token or handle gracefully
          setFcmToken('no_permission');
        }
      } catch (error) {
        console.error('Error getting push token:', error);
        // Fallback for Expo Go or when Firebase is not available
        setFcmToken('expo_go_fallback');
      }
    };

    getFcmToken();
  }, []);

  const handleChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text.slice(-1);
    setOtp(newOtp);

    if (text && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (!phone || phone.trim().length === 0) {
      return false;
    }
    
    if (digitsOnly.length < 8) {
      return false;
    }
    
    if (digitsOnly.length > 15) {
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (isSendingOtp) return; // Prevent multiple requests
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      showError("Invalid Phone Number", "Please enter a valid phone number with at least 8 digits.");
      return;
    }

    setIsSendingOtp(true);
    
    try {
      const formdata = new FormData()
      formdata.append("country_code", "+966")
      formdata.append("mobile_number", phoneNumber?.startsWith("0") ? phoneNumber.slice(1)?.replace(/\D/g, '') : phoneNumber?.replace(/\D/g, ''))
      
      console.log("Sending OTP request:", formdata)
      const response = await handleSendOtp(formdata)
      console.log("OTP response:", response)
      
      if (response?.data?.otpId) {
        setOtpId(response?.data?.otpId)
        useAsyncStorage("otp_id").setItem(response?.data?.otpId)
        openSheet()
        showError("OTP Sent", "Verification code has been sent to your phone.", "success");
      } else {
        const errorMessage = response?.message || response?.error || "Failed to send OTP. Please try again.";
        showError("OTP Failed", errorMessage);
      }
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      showError(errorInfo.title, errorInfo.message, errorInfo.type);
    } finally {
      setIsSendingOtp(false);
    }
  }

  const handleValidate = async () => {
    if (isValidating) return; // Prevent multiple submissions
    
    // Validate OTP
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showError("Invalid OTP", "Please enter the complete 6-digit verification code.");
      return;
    }
    
    if (!otpId) {
      showError("Session Error", "OTP session expired. Please request a new code.");
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Ensure we have an FCM token before proceeding
      const tokenToSend = fcmToken || 'no_token_available';
      
      const formdata = new FormData()
      formdata.append("otp_id", otpId)
      formdata.append("otp", otpString)
      formdata.append("device_type", Platform.OS === 'ios' ? "2" : "1") // 1 for Android, 2 for iOS
      formdata.append("fcm_token", tokenToSend)
      
      console.log("Validating OTP with push token:", tokenToSend)
      
      const response = await handleVerifyOtp(formdata)
      
      if (response?.data?.type) {
        console.log("OTP validation successful:", response)
        closeSheet();
        
        if (response?.data?.type == "register") {
          router.replace(`/register`);
        } else {
          await useAsyncStorage('userDetails').setItem(JSON.stringify(response?.data))
          // For existing users, go directly to book tab (normal user flow)
          router.push(`/(tabs)/book`);
        }
      } else {
        const errorMessage = response?.message || response?.error || "Invalid OTP. Please try again.";
        showError("Verification Failed", errorMessage);
      }
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      showError(errorInfo.title, errorInfo.message, errorInfo.type);
    } finally {
      setIsValidating(false);
    }
  }

  const openSheet = () => {
    setVisible(true);
    // Reset keyboard height when opening
    setKeyboardHeight(0);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <View>
      <TouchableOpacity
        onPress={disabled ? undefined : handleLogin}
        disabled={disabled || isSendingOtp}
        className={`flex items-center rounded-full w-full h-[54px] cursor-pointer mb-5 ${
          disabled || isSendingOtp ? 'bg-gray-400 opacity-50' : 'bg-[#FF4848]'
        }`}
        activeOpacity={disabled || isSendingOtp ? 1 : 0.8}
      >
        <Text
          fontSize={20}
          className="my-auto text-[20px] text-white font-[Kanit-Regular]"
        >
          {isSendingOtp ? "Sending..." : t("Verify")}
        </Text>
      </TouchableOpacity>

      <Modal 
        transparent 
        visible={visible} 
        animationType="none"
        presentationStyle="overFullScreen"
      >
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <Animated.View
                style={{ 
                  transform: [{ translateY }],
                }}
                className="bg-white rounded-t-3xl max-h-[90%]"
              >
                  {Platform.OS === 'ios' ? (
                    <ScrollView
                      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      bounces={false}
                      contentInsetAdjustmentBehavior="automatic"
                      automaticallyAdjustsScrollIndicatorInsets={false}
                    >
                      <View className="flex flex-col items-center relative">
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={closeSheet}
                          className="absolute top-4 right-4 z-10"
                        >
                          <XIcon className="size-4" color="#666666" />
                        </TouchableOpacity>
                        <OtpAnimation />
                        <Text
                          fontSize={25}
                          className="text-[25px] mb-[25px] font-[Kanit-Regular] text-center"
                        >
                          {t("Please Verify Your Number")}
                        </Text>
                        <Text
                          fontSize={14}
                          className="text-[14px] text-center text-[#666666] font-[Kanit-Light] mb-7"
                        >
                          {t(
                            "Please enter the six-digit verification code that we have sent to your mobile number ending in"
                          )}
                          <Text fontSize={14} className="text-[#FF4848]">
                            {t("endingDigits", { ns: "components", digits: "***"+phoneNumber?.slice(-3) })}
                          </Text>
                        </Text>
                        <View className="flex-row justify-center">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <TextInput
                              key={i}
                              ref={(r) => { refs.current[i] = r!; }}
                              value={otp[i]}
                              onChangeText={(t) => handleChange(t, i)}
                              onKeyPress={(e) => handleKeyPress(e, i)}
                              maxLength={1}
                              keyboardType="number-pad"
                              className="size-[50px] border border-[#D9D8D8] rounded-[10px] text-center text-[18px] text-[Kanit-Regular] mx-1"
                            />
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={handleValidate}
                          disabled={isValidating || otp.join('').length !== 6}
                          className={`rounded-full w-full max-w-[200px] h-[54px] mb-5 mt-10 justify-center items-center ${
                            isValidating || otp.join('').length !== 6 
                              ? 'bg-gray-400' 
                              : 'bg-[#FF4848]'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text
                            fontSize={20}
                            className="text-white text-[20px] font-[Kanit-Regular]"
                          >
                            {isValidating ? "Verifying..." : t("Verify")}
                          </Text>
                        </TouchableOpacity>

                        <View className="text-[14px] text-center text-[#666666] font-[Kanit-Light]">
                          <Text
                            fontSize={14}
                            className="text-[14px] text-center text-[#666666] font-[Kanit-Light]"
                          >
                            {t(
                              "If you haven't received the code, please check your messages or"
                            )}
                            <Text
                              fontSize={14}
                              className="text-[#FF4848] font-[Kanit-Regular]"
                            >
                              {" "}
                              {t("request a new code.")}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </ScrollView>
                  ) : (
                    <KeyboardAwareScrollView
                      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      enableOnAndroid={true}
                      enableAutomaticScroll={true}
                      bounces={false}
                    >
                      <View className="flex flex-col items-center relative">
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={closeSheet}
                          className="absolute top-4 right-4 z-10"
                        >
                          <XIcon className="size-4" color="#666666" />
                        </TouchableOpacity>
                        <OtpAnimation />
                        <Text
                          fontSize={25}
                          className="text-[25px] mb-[25px] font-[Kanit-Regular] text-center"
                        >
                          {t("Please Verify Your Number")}
                        </Text>
                        <Text
                          fontSize={14}
                          className="text-[14px] text-center text-[#666666] font-[Kanit-Light] mb-7"
                        >
                          {t(
                            "Please enter the six-digit verification code that we have sent to your mobile number ending in"
                          )}
                          <Text fontSize={14} className="text-[#FF4848]">
                            {t("endingDigits", { ns: "components", digits: "***"+phoneNumber?.slice(-3) })}
                          </Text>
                        </Text>
                        <View className="flex-row justify-center">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <TextInput
                              key={i}
                              ref={(r) => { refs.current[i] = r!; }}
                              value={otp[i]}
                              onChangeText={(t) => handleChange(t, i)}
                              onKeyPress={(e) => handleKeyPress(e, i)}
                              maxLength={1}
                              keyboardType="number-pad"
                              className="size-[50px] border border-[#D9D8D8] rounded-[10px] text-center text-[18px] text-[Kanit-Regular] mx-1"
                            />
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={handleValidate}
                          disabled={isValidating || otp.join('').length !== 6}
                          className={`rounded-full w-full max-w-[200px] h-[54px] mb-5 mt-10 justify-center items-center ${
                            isValidating || otp.join('').length !== 6 
                              ? 'bg-gray-400' 
                              : 'bg-[#FF4848]'
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text
                            fontSize={20}
                            className="text-white text-[20px] font-[Kanit-Regular]"
                          >
                            {isValidating ? "Verifying..." : t("Verify")}
                          </Text>
                        </TouchableOpacity>

                        <View className="text-[14px] text-center text-[#666666] font-[Kanit-Light]">
                          <Text
                            fontSize={14}
                            className="text-[14px] text-center text-[#666666] font-[Kanit-Light]"
                          >
                            {t(
                              "If you haven't received the code, please check your messages or"
                            )}
                            <Text
                              fontSize={14}
                              className="text-[#FF4848] font-[Kanit-Regular]"
                            >
                              {" "}
                              {t("request a new code.")}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </KeyboardAwareScrollView>
                  )}
                </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Error Dialog - only show if no onError callback provided */}
      {!onError && (
        <AlertDialog
          visible={errorDialog.visible}
          onClose={closeErrorDialog}
          title={errorDialog.title}
          message={errorDialog.message}
          type={errorDialog.type}
          confirmText="OK"
        />
      )}
    </View>
  );
};

export default VerifyOtp;