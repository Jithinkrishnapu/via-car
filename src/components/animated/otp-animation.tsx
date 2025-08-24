import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const OtpAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/otp.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 155,
    height: 155,
  },
  animation: {
    width: 155,
    height: 155,
  },
});

export default OtpAnimation;
