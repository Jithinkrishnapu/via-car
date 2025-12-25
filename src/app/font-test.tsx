import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/components/common/text';
import { useDynamicFont } from '@/components/hoc/withDynamicFont';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function FontTest() {
  const { t, i18n } = useTranslation();
  const { isArabic } = useDynamicFont();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    await i18n.changeLanguage(newLang);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text fontSize={18} fontWeight="medium">
          Font Test - {isArabic ? 'اختبار الخطوط' : 'Font Test'}
        </Text>
      </View>

      <View className="p-6 space-y-6">
        {/* Language Toggle */}
        <TouchableOpacity 
          onPress={toggleLanguage}
          className="bg-blue-500 p-4 rounded-lg items-center"
        >
          <Text fontSize={16} fontWeight="medium" className="text-white">
            {isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          </Text>
        </TouchableOpacity>

        {/* Current Language Info */}
        <View className="bg-gray-100 p-4 rounded-lg">
          <Text fontSize={14} fontWeight="regular">
            Current Language: {i18n.language}
          </Text>
          <Text fontSize={14} fontWeight="regular">
            Font Family: {isArabic ? 'Cairo' : 'Kanit'}
          </Text>
          <Text fontSize={14} fontWeight="regular">
            Direction: {isArabic ? 'RTL' : 'LTR'}
          </Text>
        </View>

        {/* Font Weight Examples */}
        <View className="space-y-4">
          <Text fontSize={20} fontWeight="bold">
            {isArabic ? 'أمثلة على أوزان الخطوط' : 'Font Weight Examples'}
          </Text>

          <View className="space-y-3">
            <Text fontSize={16} fontWeight="light">
              {isArabic ? 'خط خفيف - Cairo Light' : 'Light Font - Kanit Light'}
            </Text>
            
            <Text fontSize={16} fontWeight="regular">
              {isArabic ? 'خط عادي - Cairo Regular' : 'Regular Font - Kanit Regular'}
            </Text>
            
            <Text fontSize={16} fontWeight="medium">
              {isArabic ? 'خط متوسط - Cairo Medium' : 'Medium Font - Kanit Medium'}
            </Text>
            
            <Text fontSize={16} fontWeight="bold">
              {isArabic ? 'خط عريض - Cairo Bold' : 'Bold Font - Kanit Bold'}
            </Text>
          </View>
        </View>

        {/* Sample Text */}
        <View className="space-y-4">
          <Text fontSize={20} fontWeight="bold">
            {isArabic ? 'نص تجريبي' : 'Sample Text'}
          </Text>

          <Text fontSize={14} fontWeight="regular">
            {isArabic 
              ? 'هذا نص تجريبي باللغة العربية لاختبار خط Cairo. يجب أن يظهر النص بشكل صحيح مع الاتجاه من اليمين إلى اليسار.'
              : 'This is sample text in English to test the Kanit font. The text should display correctly with left-to-right direction.'
            }
          </Text>
        </View>

        {/* Numbers and Mixed Content */}
        <View className="space-y-4">
          <Text fontSize={20} fontWeight="bold">
            {isArabic ? 'الأرقام والمحتوى المختلط' : 'Numbers and Mixed Content'}
          </Text>

          <Text fontSize={14} fontWeight="regular">
            {isArabic 
              ? 'الرقم: 123456 والتاريخ: 2024/12/25'
              : 'Number: 123456 and Date: 2024/12/25'
            }
          </Text>

          <Text fontSize={14} fontWeight="regular">
            {isArabic 
              ? 'السعر: ر.س 150.00'
              : 'Price: SR 150.00'
            }
          </Text>
        </View>

        {/* Different Font Sizes */}
        <View className="space-y-4">
          <Text fontSize={20} fontWeight="bold">
            {isArabic ? 'أحجام خطوط مختلفة' : 'Different Font Sizes'}
          </Text>

          <Text fontSize={12} fontWeight="regular">
            {isArabic ? 'حجم صغير - 12px' : 'Small Size - 12px'}
          </Text>
          
          <Text fontSize={14} fontWeight="regular">
            {isArabic ? 'حجم متوسط - 14px' : 'Medium Size - 14px'}
          </Text>
          
          <Text fontSize={16} fontWeight="regular">
            {isArabic ? 'حجم كبير - 16px' : 'Large Size - 16px'}
          </Text>
          
          <Text fontSize={20} fontWeight="regular">
            {isArabic ? 'حجم كبير جداً - 20px' : 'Extra Large Size - 20px'}
          </Text>
          
          <Text fontSize={24} fontWeight="regular">
            {isArabic ? 'حجم عملاق - 24px' : 'Giant Size - 24px'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}