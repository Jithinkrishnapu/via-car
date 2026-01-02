import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import Text from '@/components/common/text';
import { useNotificationStore } from '@/hooks/useNotificationStore';

interface NotificationBadgeProps {
  size?: number;
  color?: string;
  showBadge?: boolean;
}

export default function NotificationBadge({ 
  size = 24, 
  color = '#000', 
  showBadge = true 
}: NotificationBadgeProps) {
  const { unreadCount } = useNotificationStore();

  const handlePress = () => {
    router.push('/notifications');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="relative p-2"
      activeOpacity={0.7}
    >
      <Bell size={size} color={color} />
      
      {showBadge && unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
          <Text 
            fontSize={10} 
            className="text-white font-bold text-[10px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}