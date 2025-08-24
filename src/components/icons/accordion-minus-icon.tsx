import type { SVGProps } from "react";

const AccordionMinusIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} width="93" height="93" viewBox="0 0 93 93" fill="none">
      <path
        d="M16.5432 76.0576C7.614 67.0607 7.66888 52.5288 16.6657 43.5997L43.5049 16.9625C52.5017 8.03333 67.0336 8.08822 75.9628 17.0851C84.8919 26.0819 84.8371 40.6138 75.8402 49.543L49.0011 76.1802C40.0042 85.1093 25.4723 85.0544 16.5432 76.0576Z"
        fill="#F5F8FA"
      />
      <g filter="url(#filter0_d_62_3957)">
        <circle cx="34.3853" cy="58.3497" r="17.4409" fill="white" />
      </g>
      <path
        d="M29.48 58.7858H40.1625"
        stroke="#282A39"
        strokeWidth="1.52608"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_d_62_3957"
          x="13.4561"
          y="40.9088"
          width="41.8582"
          height="41.8582"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3.48819" />
          <feGaussianBlur stdDeviation="1.74409" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_62_3957"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_62_3957"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default AccordionMinusIcon;
