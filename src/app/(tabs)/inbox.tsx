import { ArrowRight, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { Separator } from "@/components/ui/separator";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Avatar from "@/components/ui/avatar";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useGetProfileDetails } from "@/service/auth";
import { generateInitials } from "@/service/chatService";

interface Chat {
  id: string;
  participants: string[];
  userNames?: { [key: string]: string };
  userTypes?: { [key: string]: 'driver' | 'customer' };
  userProfileImages?: { [key: string]: string | null };
  lastMessage: string;
  lastMessageAt: any;
}

export default function Page() {
  const loaded = useLoadFonts();
  const { t, i18n } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const [userDetails, setUserDetails] = useState();
  const [userId, setUserId] = useState();
  if (!loaded) return null;

  // Translate data
  const requests = [
    {
      name: i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn"),
      from: t("inbox.fromValue"),
      to: t("inbox.toValue"),
      date: t("inbox.dateValue"),
      time: t("inbox.timeValue"),
    },
    {
      name: i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn"),
      from: t("inbox.fromValue"),
      to: t("inbox.toValue"),
      date: t("inbox.dateValue"),
      time: t("inbox.timeValue"),
    },
    {
      name: i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn"),
      from: t("inbox.fromValue"),
      to: t("inbox.toValue"),
      date: t("inbox.dateValue"),
      time: t("inbox.timeValue"),
    },
    {
      name: i18n.language === "ar" ? t("inbox.nameAr") : t("inbox.nameEn"),
      from: t("inbox.fromValue"),
      to: t("inbox.toValue"),
      date: t("inbox.dateValue"),
      time: t("inbox.timeValue"),
    },
  ];

  const handleProfileDetails=async()=>{
    const response = await useGetProfileDetails()
    console.log("response=====================",response)
    if(response?.data){
      setUserDetails(response?.data)
      setUserId(response?.data?.id)
    }
    }
  
    useEffect(()=>{
      handleProfileDetails()
    },[])

  const [chats, setChats] = useState<Chat[]>([]);

  console.log("cahats============",chats)

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up chat listener for userId:", userId);
    
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", String(userId)),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      console.log("Chat snapshot received, docs count:", snapshot.docs.length);
      const list: Chat[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        console.log("Chat data:", data);
        return {
          id: doc.id,
          participants: data?.participants || [],
          userNames: data?.userNames || {
            [data?.from_id]: data?.from_name,
            [data?.to_id]: data?.to_name
          },
          userTypes: data?.userTypes || {
            [data?.from_id]: data?.from_user_type || 'customer',
            [data?.to_id]: data?.to_user_type || 'customer'
          },
          userProfileImages: data?.userProfileImages || {
            [data?.from_id]: data?.from_profile_image || null,
            [data?.to_id]: data?.to_profile_image || null
          },
          lastMessage: data?.lastMessage ?? '',
          lastMessageAt: data?.lastMessageAt ?? null,
        } as Chat;
      }).filter(chat => {
        // Filter out chats where user is talking to themselves
        const otherUserId = chat.participants.find((u) => String(u) !== String(userId));
        return otherUserId && String(otherUserId) !== String(userId);
      });
      console.log("Processed chats:", list);
      setChats(list);
    });

    return () => unsub();
  }, [userId]);
  
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="font-[Kanit-Regular] w-full mx-auto px-4 pt-16 pb-10 flex-col bg-gray-50">
        <Text
          fontSize={24}
          className="text-[24px] font-[Kanit-SemiBold] lg:text-[2.188rem] mb-6 text-gray-900 px-2"
        >
          {t("inbox.title")}
        </Text>
        
        <View className="bg-white rounded-xl shadow-sm border border-gray-100">
          {chats.length === 0 ? (
            <View className="py-12 px-6 items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Text fontSize={24} className="text-gray-400">💬</Text>
              </View>
              <Text fontSize={16} className="text-gray-500 font-[Kanit-Medium] text-center mb-2">
                No conversations yet
              </Text>
              <Text fontSize={14} className="text-gray-400 font-[Kanit-Regular] text-center">
                Your messages will appear here
              </Text>
            </View>
          ) : (
            chats.map((chat, index) => {
              // Find the other user ID (not the current user)
              const otherUserId = chat.participants.find((u) => String(u) !== String(userId));
              // Get the other user's name from the userNames mapping
              const otherUserName = chat.userNames?.[otherUserId] || "Unknown User";
              // Get the other user's type
              const otherUserType = chat.userTypes?.[otherUserId] || 'customer';
              // Get the other user's profile image
              const otherUserProfileImage = chat.userProfileImages?.[otherUserId];
              
              return (
                <Fragment key={chat.id}>
                  <TouchableOpacity
                    onPress={() => router.push({ 
                      pathname: "/(inbox)/chat", 
                      params: { 
                        driver_id: otherUserId,
                        driver_name: otherUserName,
                        driver_profile_image: otherUserProfileImage || ""
                      } 
                    })}
                    className="flex-row items-center gap-4 px-4 py-4 active:bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="relative">
                      <Avatar
                        source={otherUserProfileImage ? { uri: otherUserProfileImage } : require(`../../../public/profile-image.jpg.webp`)}
                        size={48}
                        initials={generateInitials(otherUserName)}
                      />
                      {/* Online indicator */}
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    </View>
                    
                    <View className="flex-col flex-1 min-w-0">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                          <Text fontSize={16} className="text-[16px] text-gray-900 font-[Kanit-Medium]" numberOfLines={1}>
                            {otherUserName}
                          </Text>
                          {/* User type badge */}
                          <View className={`ml-2 px-2 py-1 rounded-full ${otherUserType === 'driver' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <Text fontSize={10} className={`text-[10px] font-[Kanit-Medium] ${otherUserType === 'driver' ? 'text-blue-600' : 'text-green-600'}`}>
                              {otherUserType === 'driver' ? '🚗 Driver' : '👤 Customer'}
                            </Text>
                          </View>
                        </View>
                        <Text fontSize={12} className="text-[12px] text-gray-400 font-[Kanit-Regular] ml-2">
                          {chat.lastMessageAt ? new Date(chat.lastMessageAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Text fontSize={14} className="text-[14px] text-gray-600 font-[Kanit-Regular] flex-1" numberOfLines={1}>
                          {chat.lastMessage || "No messages yet"}
                        </Text>
                        {chat.lastMessage && (
                          <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                        )}
                      </View>
                    </View>
                    
                    <ChevronRight className="size-[18px] ml-2" color="#9CA3AF" strokeWidth={1.5} />
                  </TouchableOpacity>
                  
                  {index !== chats.length - 1 && (
                    <View className="ml-16 mr-4">
                      <Separator className="border-t border-gray-100 bg-transparent" />
                    </View>
                  )}
                </Fragment>
              );
            })
          )}
        </View>
        
        {/* Add some bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
