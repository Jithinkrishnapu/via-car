import type { SVGProps } from "react";

const AccordionPlusIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width="93"
      height="92"
      viewBox="0 0 93 92"
      fill="none"
    >
      <path
        d="M16.5432 75.2627C7.614 66.2658 7.66888 51.7339 16.6657 42.8047L43.5049 16.1676C52.5017 7.23841 67.0336 7.2933 75.9628 16.2902C84.8919 25.287 84.8371 39.8189 75.8402 48.7481L49.0011 75.3853C40.0042 84.3144 25.4723 84.2595 16.5432 75.2627Z"
        fill="#F5F8FA"
      />
      <g filter="url(#filter0_d_62_3985)">
        <circle cx="34.3853" cy="57.5551" r="17.4409" fill="white" />
      </g>
      <path
        d="M34.8208 52.1412V63.8412"
        stroke="#0F1822"
        strokeWidth="1.74409"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.9712 57.991H40.6711"
        stroke="#0F1822"
        strokeWidth="1.74409"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_d_62_3985"
          x="13.4561"
          y="40.1141"
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
            result="effect1_dropShadow_62_3985"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_62_3985"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default AccordionPlusIcon;
