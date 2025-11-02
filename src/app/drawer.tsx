// src/components/Drawer.tsx
import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { DrawerComponent } from './drawer-component';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width;

type Props = { visible: boolean; onClose: () => void };

export default function Drawer({ visible =false, onClose }: Props) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx }) => dx < -10,
    onPanResponderMove: (_, { dx }) => {
      const newX = dx > 0 ? 0 : dx;
      translateX.setValue(newX);
    },
    onPanResponderRelease: (_, { dx }) => {
      if (dx < -DRAWER_WIDTH / 3) onClose();
      else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  if (!visible) return null;

  return (
    <>
      {/* semi-transparent overlay */}
      <Pressable onPress={onClose} style={styles.overlay} />

      {/* drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
        ]}
        {...pan.panHandlers}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#374151" />
          </Pressable>
        </View>

        {/* your content */}
        <DrawerComponent />
      </Animated.View>
    </>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 40,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    zIndex: 50,
  },
  header: {
    padding: 16,
    paddingTop: 48,               // status-bar offset
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
});