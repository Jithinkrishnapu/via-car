import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import LeftArrow from "../icons/left-arrow";
import RightArrow from "../icons/right-arrow";

function CalendarBasic({
  className,
  classNames,
  selected,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      formatters={{
        formatWeekdayName: (date, options) =>
          date.toLocaleDateString("en-US", { weekday: "short" }),
        formatDay: (date, options) => {
          return (
            <div className="relative">
              <div
                className={cn(
                  "size-9 text-base flex items-center justify-center",
                  selected && (selected as Date)?.getDate() == date.getDate()
                    ? "bg-[#2DA771] text-white rounded-full"
                    : ""
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        },
      }}
      classNames={{
        months: "flex flex-col sm:flex-row gap-0",
        month: "flex flex-col gap-4 text-[#4A5660] text-[20px] font-[Kanit-Regular]",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-[Kanit-Regular] text-[#4A5660] text-base",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "w-[12px] h-[7px] bg-transparent p-0 opacity-50 hover:opacity-100 text-[#B5BEC6]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex mb-2 gap-2",
        head_cell:
          "text-[#B5BEC6] uppercase rounded-md w-full font-[Kanit-Regular] text-[0.8rem] py-4",
        row: "flex w-full mt-4 gap-2 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:text-white [&:has([aria-selected])]:bg-[#2DA771] [&:has([aria-selected].day-range-end)]:rounded-r-full size-9 flex items-center justify-center",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full"
            : "[&:has([aria-selected])]:rounded-full"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-[44px] p-0 font-[Kanit-Regular] aria-selected:opacity-100 rounded-full text-[#4A5660]"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[#2DA771] aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-[#2DA771] aria-selected:text-white",
        day_selected:
          "bg-[#2DA771] text-white hover:bg-[#2DA771] hover:text-white focus:bg-[#2DA771] focus:text-white",
        day_today: "",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <LeftArrow className={cn("!size-5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <RightArrow className={cn("!size-5", className)} {...props} />
        ),
        ...props.components,
      }}
      {...props}
    />
  );
}

export { CalendarBasic };
