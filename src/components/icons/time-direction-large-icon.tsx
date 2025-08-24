import React from "react";

interface TimeDirectionLargeIconProps {
  time: string;
}

const TimeDirectionLargeIcon: React.FC<TimeDirectionLargeIconProps> = ({
  time,
}) => {
  return (
    <svg
      width="68"
      height="181"
      viewBox="0 0 68 181"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="33.5"
        y1="21.5"
        x2="33.5"
        y2="82.5"
        stroke="#B1FFDA"
        strokeLinecap="round"
        strokeDasharray="3.52 3.52"
      />
      <line
        x1="33.5"
        y1="82.5"
        x2="33.5"
        y2="156.5"
        stroke="#B1FFDA"
        strokeLinecap="round"
        strokeDasharray="3.52 3.52"
      />
      <path
        d="M45.1318 162.818C43.7439 156.738 38.417 154 33.7377 154C33.7377 154 33.7377 154 33.7245 154C29.0585 154 23.7183 156.724 22.3304 162.805C20.7839 169.597 24.9608 175.348 28.7413 178.968C30.1424 180.31 31.9401 180.982 33.7377 180.982C35.5354 180.982 37.3331 180.31 38.721 178.968C42.5014 175.348 46.6784 169.61 45.1318 162.818ZM33.7377 169.412C31.4378 169.412 29.574 167.557 29.574 165.266C29.574 162.976 31.4378 161.121 33.7377 161.121C36.0377 161.121 37.9015 162.976 37.9015 165.266C37.9015 167.557 36.0377 169.412 33.7377 169.412Z"
        fill="#C02120"
      />
      <circle
        cx="32.9042"
        cy="12.9042"
        r="11.1446"
        fill="white"
        stroke="#00665A"
        strokeWidth="3.51934"
      />
      <rect
        x="0.386775"
        y="80.3868"
        width="66.4264"
        height="20.2264"
        rx="10.1132"
        fill="white"
        stroke="#B1FFDA"
        strokeWidth="0.773551"
      />
      <text
        className="text-[10px] text-[#424242] font-medium font-sans"
        x="34"
        y="94"
        textAnchor="middle"
        fill="#424242"
      >
        {time}
      </text>
    </svg>
  );
};

export default TimeDirectionLargeIcon;
