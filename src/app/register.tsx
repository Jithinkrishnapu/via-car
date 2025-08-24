import Text from "@/components/common/text";
import {
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import VerifyOtp from "@/components/login/verify-otp";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { InputComponent } from "@/components/inputs/common-input";

const { height } = Dimensions.get("window");

function Register() {
  const { t } = useTranslation("index");
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

         <InputComponent/>
          <VerifyOtp />
        </View>
      </View>
    </ScrollView>
  );
}

export default Register;
