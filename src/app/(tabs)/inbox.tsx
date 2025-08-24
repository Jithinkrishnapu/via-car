import { ArrowRight, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { Separator } from "@/components/ui/separator";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Avatar from "@/components/ui/avatar";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

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

  return (
    <ScrollView className="font-[Kanit-Regular] w-full mx-auto px-6 pt-16 pb-10 flex-col gap-2 bg-white">
      <Text
        fontSize={22}
        className="text-[22px] font-[Kanit-Medium] lg:text-[2.188rem] mb-4"
      >
        {t("inbox.title")}
      </Text>
      {requests.map((request, index) => (
        <Fragment key={index}>
          <TouchableOpacity
            onPress={() => router.push("/(inbox)/chat")}
            className="flex-row items-center gap-4 py-2"
            activeOpacity={0.8}
          >
            <Avatar
              source={require(`../../../public/profile-img.png`)}
              size={35}
              initials="CN"
            />
            <View className="flex-col flex-1">
              <Text
                fontSize={14}
                className="text-[14px] text-black font-[Kanit-Regular]"
              >
                {request.name}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Light] text-[#666666]"
                >
                  {t("inbox.from", { from: request.from })}
                </Text>
                <ArrowRight
                  width={12}
                  height={12}
                  className="size-[12px]"
                  color="#A5A5A5"
                />
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Light] text-[#666666]"
                >
                  {t("inbox.to", { to: request.to })}
                </Text>
              </View>
              <Text
                fontSize={12}
                className="text-[12px] text-[#939393] font-[Kanit-Light] flex-row items-center gap-2"
              >
                <Text fontSize={12}>
                  {t("inbox.date", { date: request.date })}
                </Text>
                <Text fontSize={12}>
                  {t("inbox.time", { time: request.time })}
                </Text>
              </Text>
            </View>
            <ChevronRight
              className="size-[15px] ml-auto"
              color="#AAAAAA"
              strokeWidth={1}
            />
          </TouchableOpacity>
          {index !== requests.length - 1 && (
            <Separator className="border-t !border-dashed !border-[#CDCDCD] bg-transparent my-[15px]" />
          )}
        </Fragment>
      ))}
    </ScrollView>
  );
}
