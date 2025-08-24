import React from "react";
import Svg, { Defs, ClipPath, G, Path, Rect, SvgProps } from "react-native-svg";

interface ClockIconProps extends SvgProps {
  stroke?: string;
  width?: number;
  height?: number;
}

const ClockIcon: React.FC<ClockIconProps> = ({
  stroke = "#000",
  width = 18,
  height = 17,
  ...rest
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 18 17"
    fill="none"
    {...rest}
  >
    <Defs>
      <ClipPath id="clip0_807_12321">
        <Rect
          width={17.9529}
          height={16}
          fill={stroke}
          transform="translate(0.00244141 0.800293)"
        />
      </ClipPath>
    </Defs>

    <G clipPath="url(#clip0_807_12321)">
      <Path
        d="M8.97904 15.4669C13.1103 15.4669 16.4594 12.4821 16.4594 8.80021C16.4594 5.11831 13.1103 2.13354 8.97904 2.13354C4.84774 2.13354 1.49866 5.11831 1.49866 8.80021C1.49866 12.4821 4.84774 15.4669 8.97904 15.4669Z"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.97913 4.80029V8.80029L11.9713 10.1336"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

export default ClockIcon;
