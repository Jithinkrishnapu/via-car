import { useState } from "react";
// import { useNavigate } from "react-router";
import { useSearchRideStore } from "@/store/useSearchRideStore";
import SwapIcon from "../icons/swap-icon";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import LocationSelect from "./location-select";
import PassengerSelect from "./passenger-select";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import { router } from "expo-router";

interface PublishRideProps {
  className?: string;
}

export default function PublishRide({ className = "" }: PublishRideProps) {
  // const navigate = useNavigate();
  const { from, to, setFrom, setTo } = useSearchRideStore();
  const [passengers, setPassengers] = useState<string>("1");

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePublish = () => {
    const params = new URLSearchParams({
      from,
      to,
      passengers,
    }).toString();

    router.navigate(`/pickup?${params}`);
  };

  return (
    <div
      className={cn(
        className,
        "bg-white py-5 lg:py-0 max-lg:rounded-b-none rounded-2xl lg:rounded-full max-lg:px-4 pl-11 pr-4 max-w-[500px] lg:max-w-[1000px] w-full mx-auto flex lg:grid grid-cols-[1fr_36px_1fr_2px_1fr_auto] flex-col lg:flex-row gap-4 lg:gap-5 h-auto lg:h-[104px] lg:drop-shadow-lg"
      )}
    >
      {/* Leaving From */}
      <div className="flex items-center h-full w-full">
        <LocationSelect
          label="Leaving From"
          name="from"
          placeholder="Select pickup"
        />
      </div>

      {/* Swap */}
      <div className="py-2 lg:py-5 grid grid-cols-1 grid-rows-1 max-lg:hidden max-w-[36px] w-full h-full">
        <Separator
          className="col-start-1 -col-end-1 row-start-1 -row-end-1 mx-auto"
          orientation="vertical"
        />
        <Button
          className="col-start-1 -col-end-1 row-start-1 -row-end-1 rounded-full my-auto cursor-pointer rotate-90 lg:rotate-0 max-lg:mx-auto"
          variant="outline"
          size="icon"
          onClick={handleSwap}
        >
          <SwapIcon />
        </Button>
      </div>

      {/* Going To */}
      <div className="flex items-center h-full w-full">
        <LocationSelect
          label="Going To"
          name="to"
          placeholder="Select dropoff"
        />
      </div>

      {/* Divider */}
      <div className="py-0 lg:py-5 max-lg:hidden">
        <Separator orientation="vertical" />
      </div>

      {/* Passengers */}
      <div className="flex items-center lg:max-w-[200px] w-full max-lg:mx-auto">
        <PassengerSelect
          initialCount={passengers}
          onCountChange={setPassengers}
        />
      </div>

      {/* Publish Button */}
      <div className="flex items-center justify-center lg:ml-auto">
        <Button
          className="bg-[#FF4848] rounded-full w-[228px] h-[50px] lg:h-[65px] cursor-pointer text-xl font-[Kanit-Regular] max-lg:w-full max-lg:text-xl max-lg:font-[Kanit-Regular]"
          onClick={handlePublish}
        >
          <CirclePlus
            className="size-[20px] lg:size-[26px] hidden lg:block"
            color="white"
          />
          <span>Publish a Ride</span>
        </Button>
      </div>
    </div>
  );
}
