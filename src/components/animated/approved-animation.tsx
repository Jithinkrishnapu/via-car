import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const ApprovedAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/approved.json")}
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
    width: 164,
    height: 174,
  },
  animation: {
    width: 164,
    height: 173,
  },
});

export default ApprovedAnimation;
