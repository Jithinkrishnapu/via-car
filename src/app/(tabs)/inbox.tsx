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

interface Chat {
  id: string;
  users: string[];
  userNames?: { [key: string]: string };
  lastMessage: string;
  updatedAt: any;
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

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Chat[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        console.log(data)
        return {
          id: doc.id,
          users: data?.participants || [], // Use participants array (user IDs)
          userNames: {
            // Map user IDs to their names using the stored from_id/to_id and from_name/to_name
            [data?.from_id]: data?.from_name,
            [data?.to_id]: data?.to_name
          }, // Map user IDs to names
          lastMessage: data?.lastMessage ?? '',
          updatedAt: data?.lastMessageAt ?? null, // Use lastMessageAt instead of updatedAt
        } as Chat;
      });
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
              const otherUserId = chat.users.find((u) => u.toString() !== userId.toString());
              // Get the other user's name from the userNames mapping
              const otherUserName = chat.userNames?.[otherUserId] || "Unknown User";
              
              return (
                <Fragment key={chat.id}>
                  <TouchableOpacity
                    onPress={() => router.push({ 
                      pathname: "/(inbox)/chat", 
                      params: { 
                        driver_id: otherUserId,
                        driver_name: otherUserName
                      } 
                    })}
                    className="flex-row items-center gap-4 px-4 py-4 active:bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="relative">
                      <Avatar
                        source={require("../../../public/profile-img.png")}
                        size={48}
                        initials={otherUserName?.charAt(0) || "U"}
                      />
                      {/* Online indicator */}
                      <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    </View>
                    
                    <View className="flex-col flex-1 min-w-0">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text fontSize={16} className="text-[16px] text-gray-900 font-[Kanit-Medium] flex-1" numberOfLines={1}>
                          {otherUserName}
                        </Text>
                        <Text fontSize={12} className="text-[12px] text-gray-400 font-[Kanit-Regular] ml-2">
                          {chat.updatedAt ? new Date(chat.updatedAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
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
