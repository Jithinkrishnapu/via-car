import React from "react";
import {
  Dimensions,
  Text as RNText,
  TextProps as RNTextProps,
} from "react-native";

export type TextProps = RNTextProps & {
  fontSize?: number;
};

const { width: SCREEN_WIDTH, fontScale: OS_FONT_SCALE = 1 } =
  Dimensions.get("window");
const BASE_WIDTH = 406;

// function adjustFont(size: number) {
//   const widthScale = SCREEN_WIDTH / BASE_WIDTH;
//   return (size * widthScale) / OS_FONT_SCALE;
// }

const Text: React.FC<TextProps> = ({ children, style, fontSize, ...props }) => {
  // console.log(SCREEN_WIDTH, OS_FONT_SCALE);
  // if (fontSize === undefined) {
  //   console.log(children);
  // }
  return (
    <RNText
      {...props}
      style={
        fontSize
          ? [
              style,
              SCREEN_WIDTH < BASE_WIDTH
                ? { fontSize: fontSize - 3 } // 5, 3
                : { fontSize: fontSize - 2 }, // 4, 2
            ]
          : [style]
      }
      maxFontSizeMultiplier={1}
      allowFontScaling={false}
      minimumFontScale={1}
      adjustsFontSizeToFit={false}
    >
      {children}
    </RNText>
  );
};

export default Text;
