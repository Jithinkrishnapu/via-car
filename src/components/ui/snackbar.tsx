import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { X, Wifi, WifiOff, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { snackbarManager, SnackbarConfig } from '@/utils/snackbar-manager';

const GlobalSnackbar: React.FC = () => {
  const [config, setConfig] = useState<SnackbarConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showListener = (newConfig: SnackbarConfig) => {
      setConfig(newConfig);
      setVisible(true);
    };

    const hideListener = () => {
      hideSnackbar();
    };

    snackbarManager.on('show', showListener);
    snackbarManager.on('hide', hideListener);

    return () => {
      snackbarManager.off('show', showListener);
      snackbarManager.off('hide', hideListener);
    };
  }, []);

  useEffect(() => {
    if (visible && config) {
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
      }, config.duration || 4000);

      return () => clearTimeout(timer);
    } else if (!visible) {
      hideSnackbar();
    }
  }, [visible, config]);

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
      setVisible(false);
      setConfig(null);
    });
  };

  const getBackgroundColor = () => {
    switch (config?.type) {
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
    const iconSize = 20;
    const iconColor = '#fff';

    if (config?.message.toLowerCase().includes('network') || 
        config?.message.toLowerCase().includes('connection')) {
      return <WifiOff size={iconSize} color={iconColor} />;
    }

    switch (config?.type) {
      case 'success':
        return <CheckCircle size={iconSize} color={iconColor} />;
      case 'warning':
        return <AlertTriangle size={iconSize} color={iconColor} />;
      case 'info':
        return <Info size={iconSize} color={iconColor} />;
      case 'error':
      default:
        return <WifiOff size={iconSize} color={iconColor} />;
    }
  };

  if (!visible || !config) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 10, // Android shadow
      }}
      className={`${getBackgroundColor()} rounded-lg shadow-lg`}
    >
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center flex-1">
          {getIcon()}
          <Text className="text-white font-[Kanit-Regular] text-[14px] flex-1 ml-3">
            {config.message}
          </Text>
        </View>
        
        <View className="flex-row items-center ml-2">
          {config.action && (
            <TouchableOpacity
              onPress={() => {
                config.action?.onPress();
                hideSnackbar();
              }}
              className="mr-3 px-2 py-1"
              activeOpacity={0.7}
            >
              <Text className="text-white font-[Kanit-Medium] text-[14px] underline">
                {config.action.label}
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

export default GlobalSnackbar;