import HomeIcon from "@/components/icons/home-icon";
import InboxIcon from "@/components/icons/inbox-icon";
import ProfileIcon from "@/components/icons/profile-icon";
import PublishIcon from "@/components/icons/publish-icon";
import YourRidesIcon from "@/components/icons/your-rides-icon";
import { PlatformPressable } from "@react-navigation/elements";
import { RelativePathString, router, Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const { t } = useTranslation("components");

  /* ---------- helper that redirects if token missing ---------- */
  const guard = async (allowedRoute: RelativePathString) => {
    const raw = await useAsyncStorage("userDetails").getItem();
    const token = raw ? JSON.parse(raw).token : "";
    if (!token) router.replace("/login");
    else router.push(allowedRoute); // normal navigation
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.container,
        tabBarLabelStyle: styles.label,
        animation: "shift",
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            android_ripple={{ color: "transparent" }}
            onPress={(e) => {
              /* which tab was pressed? */
              const target = (props.children as any)?.props?.name;

              /* protect only these two tabs */
              if (target === "pickup" || target === "user-profile") {
                guard(target);
              } else {
                props.onPress?.(e); // default behaviour
              }
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="book"
        options={{
          title: t("tabs.home"),
          tabBarAllowFontScaling: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <HomeIcon active={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pickup"
        options={{
          title: t("tabs.publish"),
          tabBarAllowFontScaling: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <PublishIcon active={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="your-rides"
        options={{
          title: t("tabs.yourRides"),
          tabBarAllowFontScaling: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <YourRidesIcon active={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: t("tabs.inbox"),
          tabBarAllowFontScaling: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <InboxIcon active={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: t("tabs.profile"),
          tabBarAllowFontScaling: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <ProfileIcon active={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 65,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingBottom: 5,
  },
  tabWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerInactive: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    width: 66,
    height: 66,
    backgroundColor: "#FF4848",
    borderRadius: 33,
    marginTop: -24,
    borderWidth: 8,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: "#585656",
    fontFamily: "Kanit-Light",
  },
});