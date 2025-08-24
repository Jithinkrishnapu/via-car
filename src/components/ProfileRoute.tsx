"use dom";

import ShadLayout from "@/components/shad-layout";
import { Button } from "@/components/ui/button";
import { useGlobalButtonHaptics } from "@/hooks/useGlobalButtonHaptics";

export default function ProfileRoute({
  navigate,
}: //   onButtonClick,
{
  navigate: typeof import("expo-router").router["navigate"];
  dom?: import("expo/dom").DOMProps;
  //   onButtonClick: (size: number) => Promise<void>;
}) {
  //   useGlobalButtonHaptics(onButtonClick);

  return (
    <ShadLayout navigate={navigate} select>
      <div className="pt-10">
        <Button>TEST</Button>
      </div>
    </ShadLayout>
  );
}
