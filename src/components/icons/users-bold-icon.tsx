import Svg, { ClipPath, Defs, G, Path, Rect, SvgProps } from "react-native-svg";

interface UsersBoldIconProps extends SvgProps {
  stroke?: string;
}

function UsersBoldIcon({
  stroke = "#000",
  width = 19,
  height = 17,
  ...rest
}: UsersBoldIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 19 17"
      fill="none"
      {...rest}
    >
      <G clipPath="url(#clip0_807_12306)">
        <Path
          d="M6.86629 10.8C8.8803 10.8 10.513 9.34497 10.513 7.55005C10.513 5.75512 8.8803 4.30005 6.86629 4.30005C4.85228 4.30005 3.2196 5.75512 3.2196 7.55005C3.2196 9.34497 4.85228 10.8 6.86629 10.8Z"
          stroke={stroke}
          strokeWidth="1.34647"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M11.5937 4.42112C12.0953 4.29518 12.6213 4.26649 13.1364 4.33698C13.6515 4.40748 14.1436 4.57552 14.5797 4.8298C15.0157 5.08408 15.3856 5.41868 15.6643 5.81107C15.943 6.20347 16.1242 6.64454 16.1955 7.10458C16.2669 7.56462 16.2268 8.03295 16.078 8.47802C15.9292 8.92309 15.675 9.33457 15.3327 9.68474C14.9904 10.0349 14.5679 10.3157 14.0936 10.508C13.6194 10.7004 13.1043 10.8 12.5832 10.8001C13.5736 10.7994 14.5496 11.0115 15.4285 11.4183C16.3074 11.8251 17.0634 12.4146 17.6325 13.137M1.81665 13.1374C2.38619 12.4154 3.14229 11.8261 4.02111 11.4193C4.89993 11.0125 5.87568 10.8001 6.86597 10.8001C7.85626 10.8 8.83203 11.0123 9.71088 11.4191C10.5897 11.8258 11.3459 12.415 11.9155 13.137"
          stroke={stroke}
          strokeWidth="1.34647"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_807_12306">
          <Rect
            width="17.9529"
            height="16"
            fill={stroke}
            transform="translate(0.694824 0.800293)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default UsersBoldIcon;
