import React from "react";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "@/lib/i18n";

import * as NavigationBar from "expo-navigation-bar";
import { ChatProvider } from "@/store/ChatContext";

NavigationBar.setButtonStyleAsync("dark");

// const firebaseConfig = {
//   apiKey: "your-api-key-here",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id"
// };

// export const db = getFirestore()


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
      {/* <QueryClientProvider client={queryClient}> */}
      <Stack initialRouteName="(publish)/upload-document" screenOptions={{ headerShown: false, animation: "none" }} />
      {/* <MapComponent/> */}
    </KeyboardAwareScrollView>
      // </QueryClientProvider>
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
