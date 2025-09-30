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

interface Chat {
  id: string;
  users: string[];
  lastMessage: string;
  updatedAt: any;
}

export default function Page() {
  const loaded = useLoadFonts();
  const { t, i18n } = useTranslation("components");
  const { isRTL, swap } = useDirection();
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

  const [chats, setChats] = useState<Chat[]>([]);
  const userId = 
  "user_123"; // 👈 inject from your backend auth

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Chat[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Chat),
      }));
      setChats(list);
    });

    return () => unsub();
  }, [userId]);

  return chats;
}

  return (
    <ScrollView className="font-[Kanit-Regular] w-full mx-auto px-6 pt-16 pb-10 flex-col gap-2 bg-white">
      <Text
        fontSize={22}
        className="text-[22px] font-[Kanit-Medium] lg:text-[2.188rem] mb-4"
      >
        {t("inbox.title")}
      </Text>
      {chats.map((chat, index) => {
  const otherUser = chat.users.find((u) => u !== userId); // get the other participant
  return (
    <Fragment key={chat.id}>
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(inbox)/chat", params: { chatId: chat.id } })}
        className="flex-row items-center gap-4 py-2"
        activeOpacity={0.8}
      >
        <Avatar
          source={require("../../../public/profile-img.png")}
          size={35}
          initials={otherUser?.[0] ?? "?"}
        />
        <View className="flex-col flex-1">
          <Text fontSize={14} className="text-[14px] text-black font-[Kanit-Regular]">
            {otherUser}
          </Text>
          <Text fontSize={12} className="text-[12px] text-[#666] font-[Kanit-Light]" numberOfLines={1}>
            {chat.lastMessage || "No messages yet"}
          </Text>
        </View>
        <ChevronRight className="size-[15px] ml-auto" color="#AAAAAA" strokeWidth={1} />
      </TouchableOpacity>
      {index !== chats.length - 1 && (
        <Separator className="border-t !border-dashed !border-[#CDCDCD] bg-transparent my-[15px]" />
      )}
    </Fragment>
  );
})}
    </ScrollView>
  );
}
