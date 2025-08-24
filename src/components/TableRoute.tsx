"use dom";

import DataTableDemo from "@/components/DataTable";
import ShadLayout from "@/components/shad-layout";
import { useGlobalButtonHaptics } from "@/hooks/useGlobalButtonHaptics";

export default function TableRoute({
  navigate,
}: {
  navigate: typeof import("expo-router").router["navigate"];
  dom?: import("expo/dom").DOMProps;
}) {
  return (
    <ShadLayout navigate={navigate} select>
      <DataTableDemo onCopyClipboard={async (value: string) => {}} />
    </ShadLayout>
  );
}
