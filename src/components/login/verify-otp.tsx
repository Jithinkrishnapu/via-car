import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import OtpAnimation from "../animated/otp-animation";
import { XIcon } from "lucide-react-native";
import { router } from "expo-router";
import Text from "../common/text";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

const VerifyOtp = () => {
  const { t } = useTranslation("components");
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openSheet}
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

      <Modal transparent visible={visible} animationType="none">
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSheet}
          className="flex-1 bg-black/50 justify-end"
        >
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="bg-white rounded-t-3xl px-6 pt-6 pb-10"
          >
            <View className="flex flex-col items-center relative">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeSheet}
                className="absolute top-4 right-4"
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
                  {t("endingDigits", { ns: "components", digits: "***325" })}
                </Text>
              </Text>
              <View className="flex-row justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <TextInput
                    allowFontScaling={false}
                    key={index}
                    maxLength={1}
                    keyboardType="number-pad"
                    className="size-[50px] border border-[#D9D8D8] rounded-[10px] text-center text-[18px] text-[Kanit-Regular] mx-1"
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={() => {
                  closeSheet();
                  router.push(`/book`);
                }}
                className="bg-[#FF4848] rounded-full w-full max-w-[200px] h-[54px] mb-5 mt-10 justify-center items-center"
                activeOpacity={0.8}
              >
                <Text
                  fontSize={20}
                  className="text-white text-[20px] font-[Kanit-Regular]"
                >
                  {t("Verify")}
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
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default VerifyOtp;
