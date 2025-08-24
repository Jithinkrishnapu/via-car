import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import { RiDoubleQuotesL } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ReviewCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="bg-[#022D4A] rounded-[5px] flex flex-col px-12 py-8 h-max overflow-hidden">
      <Carousel setApi={setApi} className="">
        <CarouselContent className="">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem className="" key={index}>
              <div className="">
                <RiDoubleQuotesL color="white" className="size-[50px]" />
                <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
                  <div className="flex flex-col">
                    <p className="text-[0.938rem] text-[#F0F0F0] leading-[185%] max-w-[550px] mb-6">
                      “Thanks to NITTE’ 100% result-oriented branding and
                      promotion strategy that we could reach out to a lot more
                      clients.” “Thanks to NITTE’ 100% result-oriented branding
                      and promotion strategy
                    </p>
                    <p className="text-base text-white font-normal">
                      Mr James jacob
                    </p>
                  </div>
                  <Avatar className="size-[50px] lg:size-[101px] max-lg:mt-6">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-0 lg:mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn("size-2 rounded-full cursor-pointer bg-[#E8E8E8]", {
              "bg-[#FF4848]": current === index + 1,
            })}
          />
        ))}
      </div>
    </div>
  );
}
