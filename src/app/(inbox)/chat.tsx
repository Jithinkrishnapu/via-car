import { useEffect, useState, useRef } from "react";
import { TouchableOpacity, View, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, Keyboard } from "react-native";
import Text from "@/components/common/text";
import Avatar from "@/components/ui/avatar";
import { ArrowRight, ChevronLeft, ChevronRight, Ellipsis, Send, TriangleAlert } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { makeChatId, sendMessage, getUserType, canUsersChat, generateInitials } from "@/service/chatService";
import { Message, useMessages } from "@/hooks/useMessages";
import { Separator } from "@/components/ui/separator";
import i18n from "@/lib/i18n";
import { useGetProfileDetails } from "@/service/auth";
import { router } from "expo-router";
import { useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

// Remove the fake IDs since we're using real user data
// const currentUserId = "user_123";
// const targetUserId = "user_456";

function Chat() {
  const { t } = useTranslation("components");
  const { isRTL } = useDirection();
  const [message, setMessage] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [userDetails, setUserDetails] = useState();
  const route = useRoute()
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);


  const handleProfileDetails = async () => {
    const response = await useGetProfileDetails()
    console.log("response=====================", response)
    if (response?.data?.first_name !== "") {
      setUserDetails(response?.data)
      const chatId = makeChatId(String(response?.data?.id), String(route?.params?.driver_id));
      console.log("chatId===============", chatId)
      setChatId(chatId)
    } else {
      router.replace("/login")
    }
  }

  useEffect(() => {
    handleProfileDetails()
  }, [])

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);


  useEffect(() => {
    console.log(`Setting up message listener for chatId: ${chatId}`);
    if (!chatId) return;
    
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("createdAt", "asc")
    );

    console.log("Message query:", JSON.stringify(q));

    const unsub = onSnapshot(q, (snapshot) => {
      console.log("Message snapshot received, docs count:", snapshot.docs.length);
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Message, "id">;
        console.log("Message data:", data);
        return {
          ...data,
          id: doc.id,
        };
      });

      console.log("Processed messages:", msgs);
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);




  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Prevent self-messaging using utility function
    if (!canUsersChat(userDetails?.id, route?.params?.driver_id)) {
      Alert.alert("Error", "You cannot send messages to yourself.");
      return;
    }
    
    console.log(userDetails.id, "userDetails===============,", route?.params?.driver_id, route?.params?.driver_name, chatId)
    
    // Determine user types using utility function
    const currentUserType = getUserType(userDetails);
    const otherUserType = route?.params?.driver_id ? 'driver' : 'customer'; // Assuming driver_id means it's a driver
    
    try {
      await sendMessage(
        chatId, 
        String(userDetails?.id), 
        String(route?.params?.driver_id), 
        message.trim(), 
        userDetails?.first_name || "User", 
        route?.params?.driver_name || "Driver",
        currentUserType,
        otherUserType,
        userDetails?.profile_image || null,
        route?.params?.driver_profile_image || null
      );
      setMessage("");
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send message");
    }
  };

  const userName = i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn");
  const from = t("inbox.fromValue");
  const to = t("inbox.toValue");
  const date = t("inbox.dateValue"); const time = t("inbox.timeValue");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-[30px] pt-16 bg-white">
        <View className="flex-row items-center gap-6">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => { router.replace("..") }}
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
              source={route?.params?.driver_profile_image ? { uri: route.params.driver_profile_image } : require("../../../public/profile-img.png")}
              size={40}
              initials={generateInitials(route?.params?.driver_name)}
            />
            <Text fontSize={20} className="text-xl">
              {route?.params?.driver_name || ""}
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
        <Separator className="mb-4 border-t border-dashed border-[#CDCDCD]" />
      </View>
      
      {/* Chat area */}
      <View 
        className="flex-1 bg-[#F5F5F5] rounded-xl mx-[30px] px-4 pt-4"
        style={{ 
          marginBottom: keyboardHeight > 0 ? keyboardHeight + 70 : 70 // Always leave space for input + extra padding when keyboard is open
        }}
      >
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
        <FlatList
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = String(item.from) === String(userDetails?.id);
            const senderType = isMe ? 
              getUserType(userDetails) : 
              (item.from_user_type || 'customer');
            
            // Determine profile image to show
            const profileImage = isMe ? 
              userDetails?.profile_image : 
              item.from_profile_image;
            
            // Generate initials from sender name
            const senderName = isMe ? 
              userDetails?.first_name : 
              item.from_name;
            const initials = generateInitials(senderName);
            
            return (
              <View
                style={{
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <View className="relative">
                  <Avatar
                    source={profileImage ? { uri: profileImage } : require(`../../../public/profile-image.jpg.webp`)}
                    size={30}
                    initials={initials}
                  />
                </View>
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
        />
      </View>
      
      {/* Bottom message input - Sticks above keyboard */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-[30px] py-4 bg-white border-t border-gray-100"
        style={{ 
          bottom: keyboardHeight > 0 ? keyboardHeight +30 : 10,
        }}
      >
        <View className="flex-row items-center">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t("chat.yourMessage")}
            placeholderTextColor="#666"
            className="flex-1 bg-white border border-[#EBEBEB] rounded-full pl-6 pr-12 h-[50px]"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            className="absolute right-3 bg-[#00D074] w-[40px] h-[40px] rounded-full items-center justify-center"
            onPress={handleSend}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
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
