import React from "react";
import Svg, { Defs, ClipPath, G, Path, Rect, SvgProps } from "react-native-svg";

interface CigaretteIconProps extends SvgProps {
  stroke?: string;
  width?: number;
  height?: number;
}

const CigaretteIcon: React.FC<CigaretteIconProps> = ({
  stroke = "#000",
  width = 19,
  height = 17,
  ...rest
}) => (
  <Svg width={width} height={height} viewBox="0 0 19 17" fill="none" {...rest}>
    <Defs>
      <ClipPath id="clip0_807_12335">
        <Rect
          width={17.9529}
          height={16}
          fill={stroke}
          transform="translate(0.694824 0.799805)"
        />
      </ClipPath>
    </Defs>

    <G clipPath="url(#clip0_807_12335)">
      <Path
        d="M14.0027 8.85951L16.4628 7.55451L17.9719 6.75201L16.8415 5.06201L15.3351 5.86201L5.07388 11.302L1.37109 13.2645L2.50157 14.9545L6.20155 12.9945L14.0027 8.85951Z"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.335 5.86206L16.4654 7.55206"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.07385 11.3022L6.20152 12.9922"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.9496 5.32972C13.9496 5.32972 13.0575 3.67972 11.596 4.33472C11.596 4.33472 10.0167 4.93722 9.0686 2.95972"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.753 4.23227C15.753 4.23227 14.7291 2.66477 13.3658 2.91977C12.9479 2.99727 12.5103 3.01477 12.0951 2.87477C11.6855 2.73727 11.2255 2.49727 11.1273 1.82227"
        stroke={stroke}
        strokeWidth={1.34647}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

export default CigaretteIcon;
