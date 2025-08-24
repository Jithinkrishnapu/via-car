import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type SeparatorProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Separator({
  orientation = "horizontal",
  className,
  style,
  ...props
}: SeparatorProps) {
  const baseStyles =
    orientation === "horizontal"
      ? "bg-border h-px w-full shrink-0"
      : "bg-border w-px h-full shrink-0";

  return (
    <View
      className={cn(baseStyles, className)}
      style={style}
      {...props}
    />
  );
}
