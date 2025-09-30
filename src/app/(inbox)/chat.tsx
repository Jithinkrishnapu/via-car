import { useEffect, useState } from "react";
import { TouchableOpacity, View, Modal, TextInput, FlatList } from "react-native";
import Text from "@/components/common/text";
import Avatar from "@/components/ui/avatar";
import { ArrowRight, ChevronLeft, ChevronRight, Ellipsis, Send, TriangleAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { makeChatId, sendMessage } from "@/service/chatService";
import { useMessages } from "@/hooks/useMessages";
import { Separator } from "@/components/ui/separator";
import i18n from "@/lib/i18n";

// fake ids for now (replace with real user ids from your backend)
const currentUserId = "user_123";
const targetUserId = "user_456";

function Chat() {
  const { t } = useTranslation("components");
  const { isRTL } = useDirection();
  const [message, setMessage] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const chatId = makeChatId(currentUserId, targetUserId);
  const messages = useMessages("user_123_user_456");

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(chatId, currentUserId, targetUserId, message.trim());
    setMessage("");
  };

  const userName = i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn"); const from = t("inbox.fromValue"); const to = t("inbox.toValue"); const date = t("inbox.dateValue"); const time = t("inbox.timeValue");

  return (
    // <View className="flex-1 bg-white">
    //   {/* Chat Messages */}

    //   {/* Input */}
    //   <View className="absolute bottom-5 left-5 right-5 flex-row items-center">
    //     <TextInput
    //       value={message}
    //       onChangeText={setMessage}
    //       placeholder={t("chat.yourMessage")}
    //       placeholderTextColor="#666"
    //       className="flex-1 bg-white border border-[#EBEBEB] rounded-full pl-6 pr-12 h-[50px]"
    //     />
    //     <TouchableOpacity
    //       className="absolute right-3 bg-[#00D074] w-[40px] h-[40px] rounded-full items-center justify-center"
    //       onPress={handleSend}
    //     >
    //       <Send size={20} color="#fff" />
    //     </TouchableOpacity>
    //   </View>
    // </View>
    <View className="flex-1 relative bg-white">
      <View className="flex-1 pb-[180px]">
        <View className="w-full flex gap-[20px] font-[Kanit-Regular] flex-1 h-full">
          {/* Header */}
          <View className="px-[30px] pt-16">
            <View className="flex-row items-center gap-6">
              <TouchableOpacity
                className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
                onPress={() => { }}
                activeOpacity={0.8}
              >
                <ChevronLeft size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center gap-4"
                onPress={() => { }}
                activeOpacity={0.8}
              >
                <Avatar
                  source={require("../../../public/profile-img.png")}
                  size={40}
                  initials="CN"
                />
                <Text fontSize={20} className="text-xl">
                  {userName}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-auto size-[34px] items-center justify-center"
                onPress={() => setShowGuidelines(true)}
                activeOpacity={0.8}
              >
                <Ellipsis size={25} stroke="#FF4848" fill="none" strokeWidth={1} />
              </TouchableOpacity>
            </View>
            <Separator className="my-[15px] border-t border-dashed border-[#CDCDCD]" />
            {/* Ride summary */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-4"
              onPress={() => { }}
              activeOpacity={0.8}
            >
              <View className="flex-col gap-1">
                <View className="flex-row items-center gap-2">
                  <Text fontSize={12} className="text-[12px]">
                    {from}
                  </Text>
                  <ArrowRight size={16} color="#FF4848" />
                  <Text fontSize={12} className="text-[12px]">
                    {to}
                  </Text>
                </View>
                <Text fontSize={10} className="text-[10px]">
                  {date} {time}{" "}
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
          <View className="bg-[#F5F5F5] rounded-xl mx-[30px] px-4 pt-12 relative h-[90%]">
            {/* Guidelines & Alerts notice */}
            <View className="items-center mb-4 px-4">
              <Text fontSize={10} className="text-[10px] text-center text-[#939393]">
                {t("chat.guidelinesNotice")} &nbsp;
                <Text fontSize={10} className="text-[#FF4848]" onPress={() => { }}>
                  {t("chat.guidelinesPage")}
                </Text>
              </Text>
              <View className="flex-row items-center mt-2">
                <TriangleAlert size={14} color="#FF0000" />
                <Text fontSize={10} className="text-[10px] text-[#FF0000] ml-1">
                  {t("chat.scamWarning")} &nbsp;
                  <Text fontSize={10} className="text-[#FF0000]" onPress={() => { }}>
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
            {/* <View className="mb-[100px] space-y-4">
              <View className="flex-row items-start gap-2">
                <Avatar
                  source={require("../../../public/profile-img.png")}
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
                  source={require("../../../public/profile-img.png")}
                  size={30}
                  initials="CN"
                />
                <View className="rounded-tr-[1px] rounded-[10px] bg-[#FF4848] px-4 py-2">
                  <Text fontSize={11} className="text-[11px] text-white">
                    {t("chat.hello")}
                  </Text>
                </View>
              </View>
            </View> */}

            <FlatList
              showsVerticalScrollIndicator={false}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              renderItem={({ item }) => {
                const isMe = item.from === currentUserId;
                return (
                  <View
                    style={{
                      flexDirection: isMe ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <Avatar
                      source={require("../../../public/profile-img.png")}
                      size={30}
                      initials="CN"
                    />
                    <View
                      style={{
                        backgroundColor: isMe ? "#FF4848" : "#D9D9D9",
                        padding: 8,
                        borderRadius: 10,
                        marginHorizontal: 8,
                        maxWidth: "75%",
                      }}
                    >
                      <Text
                        fontSize={11}
                        className={`text-[11px] ${isMe ? "text-white" : "text-black"}`}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />˝

            {/* Bottom message input */}
            <View className="absolute bottom-5 left-5 right-5 flex-row items-center">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={t("chat.yourMessage")}
                placeholderTextColor="#666"
                className="flex-1 bg-white border border-[#EBEBEB] rounded-full pl-6 pr-12 h-[50px]"
              />
              <TouchableOpacity
                className="absolute right-3 bg-[#00D074] w-[40px] h-[40px] rounded-full items-center justify-center"
                onPress={handleSend}
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
              <Text fontSize={14} className="text-[#FF4848]" onPress={() => { }}>
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
