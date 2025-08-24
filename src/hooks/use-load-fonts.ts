import { useFonts } from "expo-font";

export function useLoadFonts() {
  const [loaded] = useFonts({
    "Kanit-Black": require("../assets/fonts/Kanit/Kanit-Black.ttf"),
    "Kanit-Bold": require("../assets/fonts/Kanit/Kanit-Bold.ttf"),
    "Kanit-ExtraBold": require("../assets/fonts/Kanit/Kanit-ExtraBold.ttf"),
    "Kanit-ExtraLight": require("../assets/fonts/Kanit/Kanit-ExtraLight.ttf"),
    "Kanit-Light": require("../assets/fonts/Kanit/Kanit-Light.ttf"),
    "Kanit-Medium": require("../assets/fonts/Kanit/Kanit-Medium.ttf"),
    "Kanit-Regular": require("../assets/fonts/Kanit/Kanit-Regular.ttf"),
    "Kanit-SemiBold": require("../assets/fonts/Kanit/Kanit-SemiBold.ttf"),
    "Kanit-Thin": require("../assets/fonts/Kanit/Kanit-Thin.ttf"),
    "Cairo": require("../assets/fonts/Cairo/Cairo-VariableFont_slnt,wght.ttf"),
    "Roboto": require("../assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf"),
    "Inter": require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
  });

  return loaded;
}
