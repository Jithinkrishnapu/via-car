import type { SVGProps } from "react";

const MoneyBagIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path
        d="M5 35C5 25.5725 5 20.8575 7.93 17.93C10.86 15.0025 15.5725 15 25 15H35C44.4275 15 49.1425 15 52.07 17.93C54.9975 20.86 55 25.5725 55 35C55 44.4275 55 49.1425 52.07 52.07C49.14 54.9975 44.4275 55 35 55H25C15.5725 55 10.8575 55 7.93 52.07C5.0025 49.14 5 44.4275 5 35Z"
        stroke="black"
        strokeWidth="1.5"
      />
      <path
        opacity="0.5"
        d="M40 15C40 10.285 40 7.93 38.535 6.465C37.07 5 34.715 5 30 5C25.285 5 22.93 5 21.465 6.465C20 7.93 20 10.285 20 15"
        stroke="black"
        strokeWidth="1.5"
      />
      <path
        opacity="0.5"
        d="M30 43.3325C32.7625 43.3325 35 41.4675 35 39.1675C35 36.8675 32.7625 35 30 35C27.2375 35 25 33.135 25 30.8325C25 28.5325 27.2375 26.6675 30 26.6675M30 43.3325C27.2375 43.3325 25 41.4675 25 39.1675M30 43.3325V45M30 26.6675V25M30 26.6675C32.7625 26.6675 35 28.5325 35 30.8325"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default MoneyBagIcon;
