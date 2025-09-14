import {
  ActivityIndicator,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCallback} from "react";

function Login() {
  
  useFocusEffect(
    useCallback(() => {
      // This runs when the screen comes into focus
      router.replace('/(tabs)/book');
    }, [])
  );

  
  const { t } = useTranslation("login");

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF4848" />
    </View>
  );
}

export default Login;
