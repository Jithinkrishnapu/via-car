import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface CheckRoundedIconProps extends SvgProps {
  stroke?: string;
  width?: number;
  height?: number;
}

const CheckRoundedIcon: React.FC<CheckRoundedIconProps> = ({
  stroke = "#000",
  width = 18,
  height = 13,
  ...rest
}) => (
  <Svg width={width} height={height} viewBox="0 0 18 13" fill="none" {...rest}>
    <Path
      d="M16.4279 1.38623L6.55378 11.2603L2.06555 6.77211"
      stroke={stroke}
      strokeWidth={2.69294}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckRoundedIcon;
