import { TouchableOpacity, View } from "react-native";
import MailAnimation from "../animated/mail-animation";
import Text from "../common/text";
import { useTranslation } from "react-i18next";

// 📂 components/modals/EmailModal.tsx
const EmailModal = ({onClose}: { onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  return(
    <View className="bg-white px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
      <MailAnimation />
      <Text
        fontSize={23}
        className="text-[23px] font-[Kanit-Regular] text-black leading-tight text-center mt-4"
      >
        {t("profile.verificationEmailSent")}
      </Text>
      <View className="flex-row items-center justify-center">
        <TouchableOpacity
          className="bg-[#FF4848] rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
          activeOpacity={0.8}
          onPress={onClose}
        >
          <Text
            fontSize={18}
            className="text-[18px] text-white text-center font-[Kanit-Medium]"
          >
            {t("profile.ok")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
  
  export default EmailModal;
  