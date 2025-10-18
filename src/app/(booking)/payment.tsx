import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Separator } from "@/components/ui/separator";
import ApprovedAnimation from "@/components/animated/approved-animation";
import { useEffect, useState } from "react";
import {
  FlatList,
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
import { getCards, KEY } from "@/store/card-store";
import { useRoute } from "@react-navigation/native";

type Status = "idle" | "waiting" | "approved";

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

function Payment() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const route = useRoute()

  const fetchSavedCards = async()=>{
    const data = await getCards()
    console?.log(data,"===================cards")
    if(data?.length){
      const iterateData = data?.map((val,index)=> {
        return  {
          id: index,
          title: `${val?.brand} ending in ${val?.last4}`,
          description: `Ex.date ${val?.expMonth}/${val?.expYear?.toString()?.slice(2,4)}`,
          img: require("../../../public/visa.png"),
        }
      }  )   
      setCardsData(iterateData)
    }

  }

  useEffect(()=>{
    fetchSavedCards()
  },[])

  const cards: Options[] = [
    {
      id: "1",
      title: t("payment.visa"),
      description: t("payment.expiry"),
      img: require("../../../public/visa.png"),
    },
    {
      id: "2",
      title: t("payment.mastercard"),
      description: t("payment.expiry"),
      img: require("../../../public/mastercard.png"),
    },
  ];
  const upi: Options[] = [
    {
      id: "3",
      title: t("payment.applePay"),
      img: require("../../../public/applepay.png"),
    },
    {
      id: "4",
      title: t("payment.samsungPay"),
      img: require("../../../public/samsungpay.png"),
    },
  ];
  const [selectedId, setSelectedId] = useState<string>("1");
  const [cardsData, setCardsData] = useState(cards);
  const [status, setStatus] = useState<Status>("idle");

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
    <View className="flex-1 relative pb-[100px]">
      <ScrollView className="font-[Kanit-Regular] w-full bg-white">
        <View className="max-w-[1379px] w-full mx-auto px-6 pt-16 lg:pt-[80px] pb-10 lg:pb-[100px] flex flex-col gap-7">
          <View className="flex-row items-center gap-4 mb-6 w-full">
            <TouchableOpacity
              className="bg-white/20 rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
              activeOpacity={0.8}
              onPress={() => router.replace("..")}
            >
              <ChevronLeft color="#3C3F4E" />
            </TouchableOpacity>
            <Text
              fontSize={22}
              className="text-[22px] text-black font-[Kanit-Medium]"
            >
              {t("payment.selectPaymentMethod")}
            </Text>
          </View>

          {/* Credit/Debit Section */}
          <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("payment.creditDebitCards")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View>

          {/* {cardsData.map(renderOption)} */}

          <FlatList
          contentContainerClassName="gap-4"
          data={cardsData}
          renderItem={(({item})=>renderOption(item))}
          />

          <TouchableOpacity
            onPress={()=>router.push({pathname:"/(booking)/add-new-card",params:{booking_id:route?.params?.booking_id}})}
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("payment.addNewCard")}
            </Text>
          </TouchableOpacity>

          {/* <Separator className="mt-2 border-t !border-dashed !border-[#DADADA] bg-transparent" /> */}

          {/* UPI Section */}
          {/* <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("payment.otherUpiApps")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View> */}

          {/* {upi.map(renderOption)} */}

          {/* <TouchableOpacity
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("payment.addNew")}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      {/* Continue Button */}
      <View
        className="flex-row items-center justify-between gap-4 w-full mx-auto absolute right-0 bottom-0 left-0 px-[27px] py-[20px] bg-white shadow-[0_20px_25px_5px_rgb(0_0_0_/_0.1)]"
        style={{
          shadowColor: "rgb(0 0 0 / 0.5)",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 1,
          shadowRadius: 25,
        }}
      >
        <View className="flex-1">
          <Text
            fontSize={16}
            className="text-[16px] text-[#666666] font-[Kanit-Regular]"
          >
            {t("payment.amount")}
          </Text>
          <Text fontSize={25} className="text-[25px] font-[Kanit-Regular]">
            {t("payment.currency")} {route?.params?.amount}
          </Text>
        </View>
        <View className="flex-1">
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full w-max h-[55px] cursor-pointer items-center justify-center"
            onPress={() => {
              setStatus("waiting");
              setTimeout(() => {
                setStatus("approved");
              }, 3000);
            }}
            activeOpacity={0.8}
          >
            <Text
              fontSize={18}
              className="text-[18px] text-center text-white font-[Kanit-Medium] uppercase"
            >
              {t("payment.pay")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Waiting Modal */}
      <Modal visible={status === "waiting"} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 py-12 rounded-t-3xl">
            <Image
              className="size-[150px] mx-auto object-contain"
              source={require(`../../../public/hour-glass.gif`)}
            />
            <Text
              fontSize={25}
              className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4"
            >
              {t("payment.waitingApproval")}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Approved Modal */}
      <Modal visible={status === "approved"} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
            <ApprovedAnimation />
            <Text
              fontSize={25}
              className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4"
            >
              {t("payment.bookingConfirmed")}
            </Text>
            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                className="bg-[#FF4848] rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setStatus("idle");
                  router.push("/book");
                }}
              >
                <Text
                  fontSize={18}
                  className="text-[18px] text-white text-center font-[Kanit-Medium]"
                >
                  {t("payment.ok")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Payment;