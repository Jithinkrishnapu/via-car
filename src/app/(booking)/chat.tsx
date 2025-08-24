import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Send,
  TriangleAlert,
} from "lucide-react-native";
import { Separator } from "@/components/ui/separator";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Avatar from "@/components/ui/avatar";
import { TouchableOpacity, View, Modal, TextInput } from "react-native";
import Text from "@/components/common/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

function Chat() {
  const loaded = useLoadFonts();
  const { t, i18n } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [message, setMessage] = useState("");

  if (!loaded) return null;

  return (
    <View className="flex-1 relative bg-white">
      <View className="flex-1 pb-[180px]">
        <View className="w-full flex gap-[20px] font-[Kanit-Regular] flex-1 h-full">
          {/* Header */}
          <View className="px-[30px] pt-16">
            <View className="flex-row items-center gap-6">
              <TouchableOpacity
                className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
                onPress={() => router.replace("..")}
                activeOpacity={0.8}
              >
                <ChevronLeft size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-4"
                onPress={() => router.push(`/(booking)/chat-profile`)}
                activeOpacity={0.8}
              >
                <Avatar
                  source={require(`../../../public/profile-img.png`)}
                  size={40}
                  initials="CN"
                />
                <Text fontSize={20} className="text-xl">
                  {t("chat.abhimanyu")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="ml-auto size-[34px] items-center justify-center"
                onPress={() => setShowGuidelines(true)}
                activeOpacity={0.8}
              >
                <Ellipsis
                  size={25}
                  stroke="#FF4848"
                  fill="none"
                  strokeWidth={1}
                />
              </TouchableOpacity>
            </View>

            <Separator className="my-[15px] border-t border-dashed border-[#CDCDCD]" />

            {/* Ride summary */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-4"
              onPress={() => router.replace("..")}
              activeOpacity={0.8}
            >
              <View className="flex-col gap-1">
                <View className="flex-row items-center gap-2">
                  <Text fontSize={12} className="text-[12px]">
                    {t("chat.alKhobar")}
                  </Text>
                  <ArrowRight size={16} color="#FF4848" />
                  <Text fontSize={12} className="text-[12px]">
                    {t("chat.alKhobar")}
                  </Text>
                </View>
                <Text fontSize={10} className="text-[10px]">
                  {t("chat.dateTime")}{" "}
                  <Text fontSize={10} className="text-[#FFBD00] ml-6">
                    {t("chat.awaitingApproval")}
                  </Text>
                </Text>
              </View>
              <ChevronRight size={16} color="#AAAAAA" />
            </TouchableOpacity>

            <Separator className="mb-4 border-t border-dashed border-[#CDCDCD]" />
          </View>

          {/* Chat area */}
          <View className="bg-[#F5F5F5] rounded-xl mx-[30px] px-4 pt-12 relative flex-1 h-full">
            {/* Guidelines & Alerts notice */}
            <View className="items-center mb-4 px-4">
              <Text
                fontSize={10}
                className="text-[10px] text-center text-[#939393]"
              >
                {t("chat.guidelinesNotice")} &nbsp;
                <Text
                  fontSize={10}
                  className="text-[#FF4848]"
                  onPress={() => router.push(`/`)}
                >
                  {t("chat.guidelinesPage")}
                </Text>
              </Text>
              <View className="flex-row items-center mt-2">
                <TriangleAlert size={14} color="#FF0000" />
                <Text fontSize={10} className="text-[10px] text-[#FF0000] ml-1">
                  {t("chat.scamWarning")} &nbsp;
                  <Text
                    fontSize={10}
                    className="text-[#FF0000]"
                    onPress={() => router.push(`/`)}
                  >
                    {t("chat.learnMore")}
                  </Text>
                </Text>
              </View>
            </View>

            {/* "New" separator */}
            <View className="flex-row items-center justify-center my-4">
              <Separator className="flex-1 border-t border-dashed border-[#CDCDCD]" />
              <Text
                fontSize={12}
                className="px-2 text-[12px] text-[#666666] bg-[#F5F5F5]"
              >
                {t("chat.new")}
              </Text>
              <Separator className="flex-1 border-t border-dashed border-[#CDCDCD]" />
            </View>

            {/* Messages */}
            <View className="mb-[100px] space-y-4">
              <View className="flex-row items-start gap-2">
                <Avatar
                  source={require(`../../../public/profile-img.png`)}
                  size={30}
                  initials="CN"
                />
                <View className="rounded-tl-[1px] rounded-[10px] bg-[#D9D9D9] px-4 py-2">
                  <Text fontSize={11} className="text-[11px]">
                    {t("chat.hello")}
                  </Text>
                </View>
              </View>
              <View className="flex-row-reverse items-start gap-2">
                <Avatar
                  source={require(`../../../public/profile-img.png`)}
                  size={30}
                  initials="CN"
                />
                <View className="rounded-tr-[1px] rounded-[10px] bg-[#FF4848] px-4 py-2">
                  <Text fontSize={11} className="text-[11px] text-white">
                    {t("chat.hello")}
                  </Text>
                </View>
              </View>
            </View>
            {/* Bottom message input */}
            <View className="absolute inset-x-4 bottom-5 flex-row items-center">
              <TextInput
                allowFontScaling={false}
                value={message}
                onChangeText={setMessage}
                placeholder={t("chat.yourMessage")}
                placeholderTextColor="#666666"
                className="flex-1 bg-white border border-[#EBEBEB] rounded-full text-sm font-[Kanit-Light] pl-6 pr-20 h-[50px]"
              />
              <TouchableOpacity
                className="absolute right-6 bg-[#00D074] w-[35px] h-[35px] rounded-full items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setMessage("");
                }}
              >
                <Send size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Messaging Guidelines Modal */}
      <Modal
        visible={showGuidelines}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuidelines(false)}
      >
        <View className="flex-1 bg-black/30 justify-end">
          <View className="bg-white rounded-t-3xl p-8">
            <Text
              fontSize={30}
              className="text-3xl text-center font-[Kanit-Regular] mb-6"
            >
              {t("chat.messagingGuidelines")}
            </Text>
            <Text
              fontSize={14}
              className="text-sm text-[#666666] font-[Kanit-Light] mb-4"
            >
              {t("chat.guidelines1")}
            </Text>
            <Text
              fontSize={14}
              className="text-sm text-[#666666] font-[Kanit-Light] mb-8"
            >
              {t("chat.guidelines2")}{" "}
              <Text
                fontSize={14}
                className="text-[#FF4848]"
                onPress={() => router.push("/")}
              >
                {t("chat.terms")}
              </Text>
            </Text>
            <TouchableOpacity
              className="self-center py-3 px-6 bg-[#FF4848] rounded-full"
              onPress={() => setShowGuidelines(false)}
              activeOpacity={0.8}
            >
              <Text fontSize={16} className="text-white font-[Kanit-Medium]">
                {t("chat.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Chat;
