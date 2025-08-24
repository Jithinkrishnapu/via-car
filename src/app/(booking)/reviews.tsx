import { useLoadFonts } from "@/hooks/use-load-fonts";
import { View, ScrollView, TouchableOpacity } from "react-native";
import Avatar from "@/components/ui/avatar";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { ChevronLeft, Star, StarHalf } from "lucide-react-native";
import Text from "@/components/common/text";

function Reviews() {
  const loaded = useLoadFonts();
  if (!loaded) return null;

  return (
    <ScrollView className="bg-[#F5F5F5] font-[Kanit-Regular]">
      <View className="max-w-[1384px] w-full mx-auto px-6 pt-16 pb-10 flex flex-col gap-4">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            className="bg-white/20 border border-[#EBEBEB] rounded-full size-[45px] items-center justify-center"
            activeOpacity={0.8}
            onPress={() => router.replace("..")}
          >
            <ChevronLeft color="#3C3F4E" />
          </TouchableOpacity>
          <Text
            fontSize={22}
            className="text-[22px] text-black font-[Kanit-Medium]"
          >
            Reviews
          </Text>
        </View>

        <View className="bg-white border border-[#EBEBEB] rounded-2xl px-4 py-6">
          <View className="flex-row items-center gap-8">
            <View className="items-center justify-center">
              <Text fontSize={70} className="text-[70px] leading-[100%]">
                4.5
              </Text>
              <View className="flex-row">
                <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                <StarHalf
                  strokeWidth={0}
                  fill="#FF9C00"
                  width={10}
                  height={10}
                />
              </View>
            </View>
            <View className="flex-1 gap-2">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <Text fontSize={12} className="text-[12px] w-4">
                    {star}
                  </Text>
                  <View className="flex-1 bg-[#D9D9D9] h-[6px] rounded-full overflow-hidden">
                    <View
                      className="h-[6px] bg-[#2DA771] rounded-r-full"
                      style={{ width: `${[50, 38, 30, 20, 35][i]}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="bg-white border border-[#EBEBEB] rounded-2xl px-6 py-6 gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Fragment key={index + "review"}>
              <View className="flex-row items-center gap-4">
                <Avatar
                  source={require(`../../../public/profile-img.png`)}
                  size={32}
                  initials="CN"
                />
                <Text fontSize={15} className="text-[15px]">
                  Fathima Rana
                </Text>
              </View>
              <View className="flex-row flex-wrap items-center gap-2">
                <View className="flex-row">
                  <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                  <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                  <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                  <Star strokeWidth={0} fill="#FF9C00" width={10} height={10} />
                  <StarHalf
                    strokeWidth={0}
                    fill="#FF9C00"
                    width={10}
                    height={10}
                  />
                </View>
                <Text fontSize={12} className="text-[12px]">
                  January 9, 2025
                </Text>
              </View>
              <Text
                fontSize={14}
                className={cn(
                  "text-[14px] font-[Kanit-Light]",
                  index === 3 && "mb-8"
                )}
              >
                Dedicated to making travel more convenient and cost-effective,
                he prioritizes safety, punctuality, and passenger comfort. By
                providing a reliable and efficient service, he ensures that
                commuters enjoy a smooth and stress-free journey.
              </Text>
              {index < 3 && (
                <View className="border-t border-dashed border-[#CDCDCD]" />
              )}
            </Fragment>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default Reviews;
