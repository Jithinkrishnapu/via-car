import type { SVGProps } from "react";

const RightPointingArrow = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} width="20" height="21" viewBox="0 0 20 21" fill="none">
      <path
        d="M4.16675 10.5H15.8334"
        stroke="#212B36"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.66675L15.8333 10.5001L10 16.3334"
        stroke="#212B36"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RightPointingArrow;
