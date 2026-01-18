import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Text from "@/components/common/text";
import { useDirection } from "@/hooks/useDirection";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsAndConditions() {
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
            Terms and Conditions
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
                1. Introduction
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                Welcome to ViaCar. By accessing or using our mobile application, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </Text>

            <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                2. Use of Service
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                You must be at least 18 years old to use this service. You agree to use the app only for lawful purposes and in accordance with these Terms.
            </Text>

             <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                3. User Accounts
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                To access certain features, you may be required to register an account. You are responsible for maintaining the confidentiality of your account credentials.
            </Text>

            <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                4. Code of Conduct
            </Text>
            <Text className="mb-6 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                Users are expected to treat drivers and other passengers with respect. Any form of harassment or inappropriate behavior will result in account suspension.
            </Text>

             <Text className="text-lg font-[Kanit-Medium] mb-2 text-[#3C3F4E]">
                5. Changes to Terms
            </Text>
            <Text className="mb-10 text-gray-600 leading-6 text-sm font-[Kanit-Light]">
                We reserve the right to modify these specific terms at any time. Continued use of the application following any changes constitutes acceptance of those changes.
            </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
