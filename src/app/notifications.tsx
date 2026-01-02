import React, { useEffect } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Bell } from "lucide-react-native";
import Text from "@/components/common/text";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useNotificationData } from "@/hooks/useNotifications";
import { NotificationItem } from "@/hooks/useNotificationStore";

export default function NotificationsPage() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { swap } = useDirection();
  
  const {
    notifications,
    isLoading,
    error,
    hasMorePages,
    refreshNotifications,
    loadMoreNotifications,
    markNotificationAsRead,
  } = useNotificationData();

  if (!loaded) return null;

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 1: // Ride Confirmation
        return '🔔';
      case 2: // Ride Completion
        return '✅';
      case 3: // Ride Cancellation
        return '❌';
      default:
        return '🔔';
    }
  };

  const getNotificationTypeColor = (type: number) => {
    switch (type) {
      case 1: // Ride Confirmation
        return 'bg-blue-50';
      case 2: // Ride Completion
        return 'bg-green-50';
      case 3: // Ride Cancellation
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Navigate to relevant screen based on notification type
    switch (notification.type) {
      case 1: // Ride Confirmation
      case 2: // Ride Completion
      case 3: // Ride Cancellation
        router.push('/(tabs)/your-rides');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleLoadMore = () => {
    if (hasMorePages && !isLoading) {
      loadMoreNotifications();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="px-6 pt-16 pb-6 bg-white">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            {swap(
              <ChevronLeft size={16} />,
              <ChevronLeft size={16} style={{ transform: [{ scaleX: -1 }] }} />
            )}
          </TouchableOpacity>
          
          <Text
            fontSize={25}
            className="text-[25px] text-black font-[Kanit-Medium] flex-1"
          >
            {t("notifications.title")}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshNotifications}
            colors={['#FF4848']}
            tintColor="#FF4848"
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text fontSize={14} className="text-red-600 text-center">
              {error}
            </Text>
            <TouchableOpacity
              onPress={refreshNotifications}
              className="mt-2 bg-red-500 rounded-lg py-2 px-4 self-center"
              activeOpacity={0.7}
            >
              <Text fontSize={12} className="text-white font-[Kanit-Medium]">
                {t("common.retry")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {notifications.length === 0 && !isLoading ? (
          // Empty state
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Bell size={32} color="#9CA3AF" />
            </View>
            <Text fontSize={18} className="text-gray-500 font-[Kanit-Medium] text-center mb-2">
              {t("notifications.emptyTitle")}
            </Text>
            <Text fontSize={14} className="text-gray-400 font-[Kanit-Regular] text-center">
              {t("notifications.emptySubtitle")}
            </Text>
          </View>
        ) : (
          // Notifications list
          <View className="space-y-3">
            {notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
              >
                <View className="flex-row items-start space-x-3">
                  {/* Notification icon */}
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${getNotificationTypeColor(notification.type)}`}>
                    <Text fontSize={16} className="text-center">
                      {getNotificationIcon(notification.type)}
                    </Text>
                  </View>

                  {/* Notification content */}
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        fontSize={16}
                        className="text-[16px] font-[Kanit-SemiBold] text-gray-900 flex-1"
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      <Text
                        fontSize={12}
                        className="text-[12px] font-[Kanit-Regular] text-gray-400 ml-2"
                      >
                        {formatDate(notification.created_at)}
                      </Text>
                    </View>
                    
                    <Text
                      fontSize={14}
                      className="text-[14px] font-[Kanit-Regular] text-gray-600 leading-5"
                      numberOfLines={2}
                    >
                      {notification.body}
                    </Text>

                    {/* Notification type */}
                    <Text
                      fontSize={12}
                      className="text-[12px] font-[Kanit-Medium] text-blue-600 mt-1"
                    >
                      {notification.type_name}
                    </Text>
                  </View>

                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <View className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Loading more indicator */}
            {isLoading && notifications.length > 0 && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#FF4848" />
                <Text fontSize={12} className="text-gray-500 mt-2">
                  Loading more notifications...
                </Text>
              </View>
            )}

            {/* No more notifications indicator */}
            {!hasMorePages && notifications.length > 0 && (
              <View className="py-4 items-center">
                <Text fontSize={12} className="text-gray-400">
                  No more notifications
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Initial loading indicator */}
        {isLoading && notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#FF4848" />
            <Text fontSize={14} className="text-gray-500 mt-4">
              Loading notifications...
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}