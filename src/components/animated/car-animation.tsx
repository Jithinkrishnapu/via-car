import React, { useRef, useEffect, useState } from "react";
import { Dimensions, Animated, Easing, View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width - 40;
const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 110;

const CAR_WIDTH = 50;
const CAR_HEIGHT = 25;

const D_PATH =
  "M13.5762 46.7641L41.3568 85.9106C49.623 97.5588 64.9551 101.764 78.0071 95.9626L107.67 82.7782L134.883 71.1442C137.635 69.9676 140.548 69.2096 143.524 68.8951L256.692 56.9397L457.409 58.2639L490.458 58.2638L582.748 58.4783C589.495 58.494 596.051 56.2347 601.356 52.0653L601.94 51.6059C607.677 47.0968 614.861 44.8333 622.147 45.2392L757.589 52.7847C765.986 53.2525 773.798 57.2341 779.111 63.7538C784.87 70.8227 793.541 74.8777 802.658 74.767L835.987 74.3625C845.573 74.2461 854.526 69.5554 860.078 61.7405L893.024 15.3711";

function unwrapAngles(angles: number[]) {
  const result = [angles[0]];
  for (let i = 1; i < angles.length; i++) {
    let diff = angles[i] - angles[i - 1];
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    result.push(result[i - 1] + diff);
  }
  return result;
}

function CarAnimation() {
  const pathRef = useRef<Path>(null);
  const [positions, setPositions] = useState<
    { x: number; y: number; angle: number }[]
  >([]);
  const progress = useRef(new Animated.Value(0)).current;

  const displayHeight = (SCREEN_WIDTH * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH;

  const animate = () => {
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: 20000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setPositions((prev) =>
        [...prev].reverse().map((p) => ({ ...p, angle: (p.angle + 180) % 360 }))
      );
      animate();
    });
  };

  useEffect(() => {
    if (!pathRef.current) return;

    const timeout = setTimeout(() => {
      const length = pathRef.current!.getTotalLength() ?? 0;
      const N = 300;
      const samples: { x: number; y: number; angle: number }[] = [];

      for (let i = 0; i <= N; i++) {
        const t = (i / N) * length;
        const p1 = pathRef.current!.getPointAtLength(t);
        const p2 = pathRef.current!.getPointAtLength(Math.min(t + 1, length));

        const x = (p1.x / VIEWBOX_WIDTH) * SCREEN_WIDTH - CAR_WIDTH / 2;
        const y = (p1.y / VIEWBOX_HEIGHT) * displayHeight - CAR_HEIGHT / 2;
        const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

        samples.push({ x, y, angle });
      }

      const forwardSamples = [...samples];
      const reverseSamples = [...samples].reverse().map((p) => ({
        ...p,
        angle: p.angle + 180,
      }));

      const combined = [...forwardSamples, ...reverseSamples];
      const unwrappedAngles = unwrapAngles(combined.map((p) => p.angle));

      const positions = combined.map((p, i) => ({
        ...p,
        angle: unwrappedAngles[i],
      }));

      setPositions(positions);

      animate();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  const translateX =
    positions.length > 1
      ? progress.interpolate({
          inputRange: positions.map((_, i) => i / (positions.length - 1)),
          outputRange: positions.map((p) => p.x),
        })
      : 0;

  const translateY =
    positions.length > 1
      ? progress.interpolate({
          inputRange: positions.map((_, i) => i / (positions.length - 1)),
          outputRange: positions.map((p) => p.y),
        })
      : 0;

  const rotate =
    positions.length > 1
      ? progress.interpolate({
          inputRange: positions.map((_, i) => i / (positions.length - 1)),
          outputRange: unwrapAngles(positions.map((p) => p.angle)).map(
            (a) => `${a}deg`
          ),
        })
      : "0deg";

  return (
    <View style={[styles.container, { height: displayHeight + CAR_HEIGHT }]}>
      <Svg
        width={SCREEN_WIDTH}
        height={displayHeight}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M13.5762 46.7641L55.568 105.936L107.67 82.7782L139.035 69.3694L256.692 56.9397L457.409 58.2639L490.458 58.2638L593.165 58.5025L610.842 44.6094L770.771 53.5191L788.227 74.9421L851.242 74.1773L893.024 15.3711"
          stroke="white"
          strokeWidth={5.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M18.7038 57.5774C23.3089 54.9234 24.8905 49.0387 22.2365 44.4336C19.5824 39.8285 13.6977 38.2469 9.09263 40.9009C4.48755 43.555 2.90594 49.4397 5.56 54.0448C8.21407 58.6499 14.0988 60.2315 18.7038 57.5774Z"
          fill="white"
          fillOpacity={0.5}
        />
        <Path
          d="M899.691 19.6386C903.692 17.3329 905.066 12.2205 902.76 8.21978C900.454 4.21907 895.342 2.84504 891.341 5.15078C887.34 7.45653 885.966 12.5689 888.272 16.5696C890.578 20.5703 895.69 21.9444 899.691 19.6386Z"
          fill="white"
          stroke="white"
          strokeOpacity={0.5}
          strokeWidth={2.53}
        />
        <Path ref={pathRef} d={D_PATH} stroke="transparent" fill="none" />
      </Svg>

      {positions.length > 1 && (
        <Animated.Image
          source={require("../../../public/car.png")}
          style={[
            styles.car,
            {
              transform: [{ translateX }, { translateY }, { rotate }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: "transparent",
  },
  car: {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    position: "absolute",
    left: 0,
    top: 0,
  },
});

export default CarAnimation;
