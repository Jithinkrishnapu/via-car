import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Text from "@/components/common/text";
import { useDirection } from "@/hooks/useDirection";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { swap } = useDirection();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity
            className="bg-white rounded-full size-[40px] flex-row items-center justify-center border border-[#EBEBEB]"
            activeOpacity={0.8}
            onPress={handleBack}
          >
            {swap(<ChevronLeft color="#3C3F4E" size={24} />, <ChevronRight color="#3C3F4E" size={24} />)}
          </TouchableOpacity>
          <Text className="text-lg font-[Kanit-Medium] text-[#3C3F4E]">
            Privacy Policy
          </Text>
          <View className="w-[40px]" /> 
        </View>

        <ScrollView 
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={false}
        >
            <Text className="mb-4 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                Last updated: January 2026
            </Text>
            
            <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                1. Information Collection
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                We collect information you provide directly to us, such as when you create an account, request a ride, or contact customer support. This may include your name, email, phone number, and payment information.
            </Text>

            <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                2. Location Information
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                When you use our services, we collect precise location data about the ride. This is essential for the functionality of the trip and safety.
            </Text>

             <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                3. Use of Information
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                We use the information we collect to provide, maintain, and improve our services, including to process transactions, facilitate payments, and send you related information.
            </Text>

            <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                4. Data Sharing
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                We may share your information with drivers to enable them to provide the service you request. We do not sell your personal data to third parties.
            </Text>

             <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                5. Security
            </Text>
            <Text className="mb-10 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
