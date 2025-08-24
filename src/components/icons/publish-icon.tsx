import Svg, { Path } from "react-native-svg";

function PublishIcon({ active = false}) {
  return (
    <Svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
    >
      <Path
        d="M12.5 22.9166C18.253 22.9166 22.9167 18.2529 22.9167 12.5C22.9167 6.74701 18.253 2.08331 12.5 2.08331C6.74704 2.08331 2.08334 6.74701 2.08334 12.5C2.08334 18.2529 6.74704 22.9166 12.5 22.9166Z"
        fill={active ? "#FFFFFF" : "#585656"}
      />
      <Path
        d="M12.5 8.33337V16.6667"
        stroke={active ? "#FF4848" : "#FFFFFF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33334 12.5H16.6667"
        stroke={active ? "#FF4848" : "#FFFFFF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default PublishIcon;
