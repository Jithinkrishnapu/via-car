import Svg, { Path } from "react-native-svg";

function SearchIcon({ ...props }) {
  return (
    <Svg {...props} width="35" height="35" viewBox="0 0 35 35" fill="none">
      <Path
        d="M16.0417 27.7083C22.485 27.7083 27.7083 22.485 27.7083 16.0417C27.7083 9.59834 22.485 4.375 16.0417 4.375C9.59834 4.375 4.375 9.59834 4.375 16.0417C4.375 22.485 9.59834 27.7083 16.0417 27.7083Z"
        fill="black"
        fillOpacity="0.1"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M30.625 30.625L24.2812 24.2812"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SearchIcon;
