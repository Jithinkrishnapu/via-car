import React from "react";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "@/lib/i18n";

import * as NavigationBar from "expo-navigation-bar";
import MapComponent from "@/components/ui/map-view";

NavigationBar.setButtonStyleAsync("dark");

function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      enableOnAndroid={true}
      extraScrollHeight={0}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
    >
      {/* <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false, animation: "none" }} /> */}
      <MapComponent/>
    </KeyboardAwareScrollView>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
});
