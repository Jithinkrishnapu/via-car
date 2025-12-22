import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { X, Wifi, WifiOff } from 'lucide-react-native';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'error',
  duration = 4000,
  onDismiss,
  action
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        hideSnackbar();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideSnackbar();
    }
  }, [visible]);

  const hideSnackbar = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      case 'error':
      default:
        return 'bg-red-600';
    }
  };

  const getIcon = () => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
      return <WifiOff size={20} color="#fff" />;
    }
    return null;
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
      className={`absolute bottom-0 left-0 right-0 mx-4 mb-8 ${getBackgroundColor()} rounded-lg shadow-lg z-50`}
    >
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          {getIcon()}
          <Text className="text-white font-[Kanit-Regular] text-[14px] flex-1 ml-2">
            {message}
          </Text>
        </View>
        
        <View className="flex-row items-center ml-2">
          {action && (
            <TouchableOpacity
              onPress={action.onPress}
              className="mr-3"
              activeOpacity={0.7}
            >
              <Text className="text-white font-[Kanit-Medium] text-[14px] underline">
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={hideSnackbar}
            className="p-1"
            activeOpacity={0.7}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default Snackbar;