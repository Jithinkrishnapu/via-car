import ChatIcon from "@/components/icons/chat-icon";
import { CiLocationOn } from "react-icons/ci";
import { LuInfo } from "react-icons/lu";
import { MdOutlineStar, MdOutlineStarHalf } from "react-icons/md";
import { FiCheckSquare } from "react-icons/fi";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function Page() {
  const loaded = useLoadFonts();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const raw = await useAsyncStorage("userDetails").getItem();
      const token = raw ? JSON.parse(raw).token : "";
      if (!token) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  if (!loaded) return null;
  return (
    <ScrollView bounces={false}>
      <View className="font-[Kanit-Regular] w-full px-6 pt-16 pb-12 flex-col items-start gap-2">
        <View className="flex-row items-center gap-4 mb-6 w-full">
          <TouchableOpacity
            className="bg-white/20 rounded-full size-[45px] items-center justify-center"
            activeOpacity={0.8}
            onPress={() => router.replace("..")}
          >
            <ChevronLeft color="#3C3F4E" />
          </TouchableOpacity>
          <Text
            fontSize={22}
            className="text-[22px] text-black font-[Kanit-Medium]"
          >
            Profile
          </Text>
          <TouchableOpacity
            className="text-[#FF4848] border-[#EBEBEB] rounded-full h-[26px] px-4 ml-auto items-center justify-center"
            activeOpacity={0.8}
          >
            <LuInfo className="size-[14px]" />
            <Text fontSize={10} className="text-[10px] font-[Kanit-Light]">
              Report this number
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-start gap-[20px] w-full">
          <Image
            className="size-[80px]"
            source={require(`../../public/profile-img.png`)}
            alt=""
          />
          <View>
            <View className="flex-row items-center justify-between gap-6">
              <Text fontSize={20} className="text-[20px]">
                Abhimanyu
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-6">
              <View>
                <View className="text-[12px] text-[#666666] font-[Kanit-Light] mb-1">
                  <View className="flex-row items-center gap-1">
                    <CiLocationOn color="black" />
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Light] text-[#666666]"
                    >
                      Al Balad, Saudi Arabia
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="flex-row items-center mb-8"
                  onPress={() => router.push(`/reviews`)}
                  activeOpacity={0.8}
                >
                  <Text fontSize={16} className="text-[16px] mr-2">
                    4.5
                  </Text>
                  <MdOutlineStar color="#FF9C00" className="size-[14px]" />
                  <MdOutlineStar color="#FF9C00" className="size-[14px]" />
                  <MdOutlineStar color="#FF9C00" className="size-[14px]" />
                  <MdOutlineStar color="#FF9C00" className="size-[14px]" />
                  <MdOutlineStarHalf color="#FF9C00" className="size-[14px]" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="rounded-full size-[37px] px-8 cursor-pointer ml-auto items-center justify-center"
            onPress={() => router.push("/chat")}
            activeOpacity={0.8}
          >
            <ChatIcon className="!stroke-[#FF4848] size-[20px]" />
          </TouchableOpacity>
        </View>
        <View className="flex-col w-full">
          <View className="flex-col gap-4 mb-8"></View>
          <View className="flex-row flex-wrap items-start gap-4 mb-[40px]">
            <View className="flex-row items-center gap-3">
              <FiCheckSquare color="#00F076" className="size-[15px]" />
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                Confirmed mail id
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <FiCheckSquare color="#00F076" className="size-[15px]" />
              <Text
                fontSize={12}
                className="text-[12px] text-[#666666] font-[Kanit-Light]"
              >
                Confirmed phone number
              </Text>
            </View>
            <Text
              fontSize={12}
              className="text-[12px] text-[#666666] font-[Kanit-Light]"
            >
              <Text fontSize={12} className="text-[#00F076] text-[15px] mr-2">
                53
              </Text>
              ride published
            </Text>
          </View>
          <Text
            fontSize={16}
            className="text-[16px] mb-3 border-b border-[#EBEBEB] pb-2"
          >
            About
          </Text>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              Phone Number
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              9484738312
            </Text>
          </View>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              Mail id
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              abhimanyu123@gmail.com
            </Text>
          </View>
          <View className="flex-row w-max gap-x-4 gap-y-2 mb-5">
            <Text
              fontSize={14}
              className="flex-1 text-[14px] text-[#666666] font-[Kanit-Light]"
            >
              Experience
            </Text>
            <Text
              fontSize={14}
              className="flex-1 text-[14px] font-[Kanit-Light]"
            >
              Intermediate
            </Text>
          </View>
          <Text
            fontSize={14}
            className="bg-[#F5F5F5] rounded-2xl p-4 text-[12px] font-[Kanit-Light] leading-tight"
          >
            Making travel more convenient and cost-effective for passengers.
            With a strong commitment to safety and punctuality, he ensures a
            smooth and comfortable ride. His reliable service helps commuters
            share journeys efficiently while fostering a sense of community on
            the road.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
