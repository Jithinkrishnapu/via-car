import {
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  XIcon,
} from "lucide-react-native";
import RideItem from "@/components/common/ride-item";
import { useState } from "react";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/common/text";
import RideFilters from "@/components/common/ride-filter";
import Direction from "../../../public/direction.svg";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Ride() {
  const loaded = useLoadFonts();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [notify, setNotify] = useState(false);
  const [email, setEmail] = useState("");

  if (!loaded) return null;
  return (
    <ScrollView>
      <View className="flex flex-col gap-[18px] bg-[#F5F5F5] pt-20 pb-[20px] px-6 w-full font-[Kanit-Regular]">
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex-1 flex-row items-center justify-between gap-4">
            <TouchableOpacity
              className="size-[45px] rounded-full border border-[#EBEBEB] bg-white items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.replace("..")}
            >
              {swap(<ChevronLeft />, <ChevronRight />)}
            </TouchableOpacity>
            <View className="flex-1 flex-col">
              <Text
                fontSize={16}
                className="text-[16px] text-[#263238] font-[Kanit-Bold] truncate flex-1"
                numberOfLines={1}
              >
                {t("booking.ride.location")}
              </Text>
              <Text
                fontSize={14}
                className="text-[14px] text-[#666666] font-[Kanit-Light]"
              >
                {t("booking.ride.todayPassenger")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-[4px] px-[11px] py-[5px] w-max shadow-none lg:hidden rounded-full border border-[#FFBDBD]"
            onPress={() => setFilterVisible(true)}
          >
            <SlidersHorizontal size={16} />
            <Text
              fontSize={15}
              className="text-[15px] text-[#263238] font-[Kanit-Regular]"
            >
              {t("booking.ride.filters")}
            </Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            visible={filterVisible}
            onRequestClose={() => setFilterVisible(false)}
          >
            <RideFilters close={() => setFilterVisible(false)} />
          </Modal>
        </View>
        <Text fontSize={22} className="text-[22px] font-[Kanit-Regular] pt-4">
          {t("booking.ride.today")}
        </Text>
        <View className="flex-col p-0 !pb-2 gap-5">
          {Array.from({ length: 14 }, (_, index) => (
            <RideItem key={index + "rideitem"} />
          ))}
        </View>
        <View className="flex items-center justify-center pb-5 pt-0 mb-5">
          {!notify ? (
            <View className="flex-1 w-full">
              <TouchableOpacity
                className="bg-[#FF4848] rounded-full h-[55px] justify-center items-center px-8 w-full"
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text
                  fontSize={20}
                  className="text-xl text-white font-[Kanit-Regular]"
                >
                  {t("booking.ride.createAlert")}
                </Text>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View className="flex-1 justify-end bg-black/40">
                  <View className="bg-white rounded-t-3xl px-6 pt-10 pb-16">
                    <TouchableOpacity
                      className="ml-auto"
                      onPress={() => setModalVisible(false)}
                    >
                      <XIcon color="#666666" size={20} />
                    </TouchableOpacity>
                    <Text
                      fontSize={25}
                      className="text-[25px] text-center font-[Kanit-Regular] mb-5"
                    >
                      {t("booking.ride.enterEmail")}
                    </Text>

                    <View className="flex-row items-center justify-center gap-4 mb-4">
                      <Direction className="w-max h-8 bg-red-500" />
                      <View className="w-max">
                        <Text
                          fontSize={13}
                          className="text-[13px] text-[#939393] font-[Kanit-Light]"
                        >
                          {t("booking.ride.pickup")}
                        </Text>
                        <Text
                          fontSize={15}
                          className="text-[15px] mb-4 font-[Kanit-Regular]"
                        >
                          {t("booking.ride.pickupLocation")}
                        </Text>
                        <Text
                          fontSize={13}
                          className="text-[13px] text-[#939393] font-[Kanit-Light]"
                        >
                          {t("booking.ride.drop")}
                        </Text>
                        <Text
                          fontSize={15}
                          className="text-[15px] font-[Kanit-Regular]"
                        >
                          {t("booking.ride.dropLocation")}
                        </Text>
                      </View>
                    </View>

                    <View className="border-t border-dashed border-[#CDCDCD] my-2" />

                    <Text
                      fontSize={16}
                      className="text-base text-[#666666] font-[Kanit-Light] text-center my-4"
                    >
                      {t("booking.ride.emailInstruction")}
                    </Text>

                    <TextInput
                      allowFontScaling={false}
                      className="bg-[#F1F1F5] border-0 rounded-full h-[55px] w-full text-[18px] font-[Kanit-Light] text-[#000] px-8 mb-5"
                      placeholder={t("booking.ride.emailPlaceholder")}
                      placeholderTextColor="#757478"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setNotify(true);
                        setModalVisible(false);
                      }}
                      className="bg-[#FF4848] rounded-full w-[229px] h-[54px] justify-center items-center self-center"
                    >
                      <Text
                        fontSize={20}
                        className="text-xl text-white font-[Kanit-Regular]"
                      >
                        {t("booking.ride.createAlert")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            <Pressable className="bg-[#2DA771] rounded-full w-full h-[55px] px-8 cursor-pointer flex-row items-center justify-center gap-[14px]">
              <Text
                fontSize={20}
                className="text-xl text-white font-[Kanit-Regular]"
              >
                {t("booking.ride.rideAlert")}
              </Text>
              <Check className="size-[20px]" stroke="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default Ride;
