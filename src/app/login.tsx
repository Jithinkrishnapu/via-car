import Text from "@/components/common/text";
import PhoneInput from "@/components/inputs/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import VerifyOtp from "@/components/login/verify-otp";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const { height } = Dimensions.get("window");

function Login() {
  
  const { t } = useTranslation("index")
  const [phoneNumber,setPhoneNumber]=useState<string>("")
  const [isChecked,setIsChecked] = useState(false)

  return (
    <ScrollView className="grid grid-cols-[1fr_max-content] min-h-screen *:font-[Kanit-Regular] w-full">
      <Image
        style={{ height: height / 2 }}
        className="object-cover w-full"
        source={require(`../../public/login.png`)}
        alt=""
      />
      <View className="flex flex-col items-center justify-start p-5 w-full overflow-y-auto rounded-t-2xl -mt-[60px] bg-white h-full">
        <View className="max-w-[420px] w-full pt-4 lg:pt-20 pb-10">
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] text-start leading-tight tracking-tight mb-6 flex-1"
          >
            {t("verify_phone_number")}
          </Text>
          <PhoneInput
            label={t("mobile_number", { ns: "components" })}
            defaultCountryCode="SA"
            className="mb-7"
            value={phoneNumber}
            onChange={(phone, countryCode) => {
              setPhoneNumber(phone?.startsWith("0") ? phone.slice(1) : phone)}}
          />
          <View className="flex flex-row gap-4 mb-7">
            <Checkbox
              onValueChange={(isChecked)=>setIsChecked(isChecked)}
              className="mt-0.5 border-[#EBEBEB] rounded-[1px] cursor-pointer"
              checked={isChecked}
            />
            <Text
              fontSize={14}
              className="text-[14px] text-[#666666] font-[Kanit-Light] cursor-pointer leading-tight tracking-tight flex-1"
            >
              {t("no_special_offers")}
            </Text>
          </View>
          <Text
            fontSize={12}
            className="text-[12px] text-[#666666] font-[Kanit-Light] tracking-tight mb-8 flex-1"
          >
            {t("agreement_text")}
          </Text>
          <VerifyOtp phoneNumber={phoneNumber!} />
          {/* <TouchableOpacity
            activeOpacity={0.8}
            className="flex items-center border border-[#EBEBEB] rounded-full w-full h-[54px] cursor-pointer mb-5"
            onPress={() =>  router.push(`/(publish)/upload-document`)}
          >
            <Text
              fontSize={20}
              className="my-auto text-[20px] text-[#FF4848] font-[Kanit-Regular]"
            >
              {t("do_it_later")}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </ScrollView>
  );
}

export default Login;
