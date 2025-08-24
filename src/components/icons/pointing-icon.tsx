import type { SVGProps } from "react";

const PointingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} width="92" height="8" viewBox="0 0 92 8" fill="none">
      <path
        d="M0.533334 4C0.533334 2.08541 2.08541 0.533334 4 0.533334C5.91459 0.533334 7.46667 2.08541 7.46667 4C7.46667 5.91459 5.91459 7.46667 4 7.46667C2.08541 7.46667 0.533334 5.91459 0.533334 4ZM92 4L85.5 7.75278V0.247223L92 4ZM4 3.35L86.15 3.35V4.65L4 4.65V3.35Z"
        fill="#8DD1C9"
      />
    </svg>
  );
};

export default PointingIcon;
