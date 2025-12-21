import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import OtpAnimation from "../animated/otp-animation";
import { XIcon } from "lucide-react-native";
import { router } from "expo-router";
import Text from "../common/text";
import { useTranslation } from "react-i18next";
import { handleSendOtp, handleVerifyOtp } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { NotificationService } from "@/services/notificationService";

const { height } = Dimensions.get("window");

const VerifyOtp = ({ phoneNumber }: { phoneNumber: string }) => {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const translateY = useRef(new Animated.Value(height)).current;
  const refs = useRef<TextInput[]>([]);
  const [otpId, setOtpId] = useState("");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const handleLogin = async () => {
    const formdata = new FormData()
    formdata.append("country_code", "+966")
    formdata.append("mobile_number", phoneNumber?.startsWith("0") ? phoneNumber.slice(1)?.replace(/\D/g, '') : phoneNumber?.replace(/\D/g, ''))
    console.log("sheeet==========", formdata)
    const response = await handleSendOtp(formdata)
    console.log("response============", response)
    if (response?.data?.otpId) {
      setOtpId(response?.data?.otpId)
      useAsyncStorage("otp_id").setItem(response?.data?.otpId)
      openSheet()
    } else {
      console.log("response============", response)
    }
  }

  const handleValidate = async () => {
    if (isValidating) return; // Prevent multiple submissions
    
    setIsValidating(true);
    
    // Ensure we have an FCM token before proceeding
    const tokenToSend = fcmToken || 'no_token_available';
    
    const formdata = new FormData()
    formdata.append("otp_id", otpId)
    formdata.append("otp", otp.join(''))
    formdata.append("device_type", Platform.OS === 'ios' ? "2" : "1") // 1 for Android, 2 for iOS
    formdata.append("fcm_token", tokenToSend)
    
    console.log("Validating OTP with push token:", tokenToSend)
    
    try {
      const response = await handleVerifyOtp(formdata)
      if (response?.data?.type) {
        console.log("OTP validation successful:", response)
        closeSheet();
        if (response?.data?.type == "register") {
          router.replace(`/register`);
        } else {
          await useAsyncStorage('userDetails').setItem(JSON.stringify(response?.data))
          router.push(`/(tabs)/book`);
        }
      } else {
        Alert.alert("Verification Failed", response?.message || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      console.log("OTP validation error:", error)
      Alert.alert("Error", "Something went wrong. Please try again.")
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
        onPress={handleLogin}
        className="bg-[#FF4848] flex items-center rounded-full w-full h-[54px] cursor-pointer mb-5"
        activeOpacity={0.8}
      >
        <Text
          fontSize={20}
          className="my-auto text-[20px] text-white font-[Kanit-Regular]"
        >
          {t("Verify")}
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
    </View>
  );
};

export default VerifyOtp;