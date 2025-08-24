import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Separator } from "@/components/ui/separator";
import ApprovedAnimation from "@/components/animated/approved-animation";
import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/common/text";
import CheckLightGreen from "../../../public/check-light-green.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

const CheckIcon = () => (
  <CheckLightGreen
    width={27}
    height={27}
    className="absolute inset-0 m-auto size-[27px]"
  />
);

interface Options {
  id: string;
  title: string;
  description?: string;
  img: ImageSourcePropType;
}

const cards: Options[] = [
  {
    id: "1",
    title: "Visa ending in 5775",
    description: "Ex.date 06/27",
    img: require("../../../public/visa.png"),
  },
  {
    id: "2",
    title: "Master ending in 5775",
    description: "Ex.date 06/27",
    img: require("../../../public/mastercard.png"),
  },
];

const upi: Options[] = [
  {
    id: "3",
    title: "Apple Pay",
    img: require("../../../public/applepay.png"),
  },
  {
    id: "4",
    title: "Samsung Pay",
    img: require("../../../public/samsungpay.png"),
  },
];

type Status = "idle" | "waiting" | "approved";

function Payment() {
  const loaded = useLoadFonts();
  const [selectedId, setSelectedId] = useState<string>("1");
  const [status, setStatus] = useState<Status>("idle");
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();

  if (!loaded) return null;

  const renderOption = ({ id, title, description, img }: Options) => {
    const isChecked = selectedId === id;

    return (
      <TouchableOpacity
        key={id}
        onPress={() => setSelectedId(id)}
        activeOpacity={0.8}
        className="border border-[#EBEBEB] p-[15px] rounded-2xl bg-[#F5F5F5] flex-row items-center gap-4"
      >
        <Image className="w-[74px] h-[45px]" source={img} alt={title} />
        <View className="flex-col items-start">
          <Text fontSize={18} className="text-[18px] font-[Kanit-Regular]">
            {title}
          </Text>
          {description && (
            <Text
              fontSize={15}
              className="text-[15px] font-[Kanit-Light] text-[#999999]"
            >
              {description}
            </Text>
          )}
        </View>
        <View className="ml-auto size-[27px] aspect-square relative border border-gray-300 rounded-full flex-row items-center justify-center">
          {isChecked && <CheckIcon />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="font-[Kanit-Regular] w-full bg-white">
      <View className="flex-1 relative pb-[100px]">
        <View className="max-w-[1379px] w-full mx-auto px-6 pt-16 lg:pt-[80px] pb-10 lg:pb-[100px] flex flex-col gap-7">
          <View className="flex-row items-center gap-4 mb-6 w-full">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            >
              {swap(
                <ChevronLeft size={24} color="#3C3F4E" />,
                <ChevronRight size={24} color="#3C3F4E" />
              )}
            </TouchableOpacity>
            <Text
              fontSize={24}
              className={swap(
                "text-2xl text-black font-[Kanit-Medium] ml-4",
                "text-2xl text-black font-[Kanit-Medium] mr-4"
              )}
            >
              {t("profile.selectPaymentMethod")}
            </Text>
          </View>

          {/* Credit/Debit Section */}
          <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("profile.creditDebitCards")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View>

          {cards.map(renderOption)}

          <TouchableOpacity
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("profile.addNewCard")}
            </Text>
          </TouchableOpacity>

          <Separator className="mt-2 border-t !border-dashed !border-[#DADADA] bg-transparent" />

          {/* UPI Section */}
          <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("profile.otherUpiApps")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View>

          {upi.map(renderOption)}

          <TouchableOpacity
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("profile.addNew")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default Payment;
