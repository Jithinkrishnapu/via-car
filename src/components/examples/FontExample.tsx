import React from 'react';
import { View } from 'react-native';
import Text from '@/components/common/text';
import { useTranslation } from 'react-i18next';
import { useDynamicFont } from '@/components/hoc/withDynamicFont';

/**
 * Example component demonstrating font switching functionality
 */
export function FontExample() {
  const { t, i18n } = useTranslation();
  const { isArabic, replaceFontClasses } = useDynamicFont();

  return (
    <View className="p-4 space-y-4">
      <Text fontSize={24} fontWeight="bold">
        {isArabic ? 'مثال على الخطوط' : 'Font Example'}
      </Text>
      
      <Text fontSize={16} fontWeight="regular">
        {isArabic 
          ? 'هذا نص باللغة العربية باستخدام خط Cairo'
          : 'This is English text using Kanit font'
        }
      </Text>
      
      <Text fontSize={14} fontWeight="light">
        {isArabic
          ? 'خط خفيف - Cairo Light'
          : 'Light font - Kanit Light'
        }
      </Text>
      
      <Text fontSize={18} fontWeight="medium">
        {isArabic
          ? 'خط متوسط - Cairo Medium'
          : 'Medium font - Kanit Medium'
        }
      </Text>
      
      <Text fontSize={20} fontWeight="bold">
        {isArabic
          ? 'خط عريض - Cairo Bold'
          : 'Bold font - Kanit Bold'
        }
      </Text>
      
      <Text fontSize={12}>
        Current language: {i18n.language} | Font family: {isArabic ? 'Cairo' : 'Kanit'}
      </Text>
    </View>
  );
}

export default FontExample;