import "../../global.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { IS_DOM } from "expo/dom";
import { StyleNoSelect } from "./style-no-select";
import { DOMRouterProvider } from "@/lib/router-with-dom";
import { Header, SideNavigationBar } from "./shad-nav";
import { useColorScheme } from "react-native";
import { cn } from "@/lib/utils";

export function ShadLayoutFull({
  navigate,
  children,
  select,
}: {
  navigate: typeof import("expo-router").router["navigate"];
  children: React.ReactNode;
  select?: boolean;
}) {
  const colorScheme = useColorScheme();

  return (
    <>
      {!select && <StyleNoSelect />}
      <DOMRouterProvider value={{ navigate }}>
        <TooltipProvider>
          <main
            className={cn("flex min-h-screen w-screen animate-fade-in", {
              "flex-col": IS_DOM,
              // dark: colorScheme === "dark",
            })}
          >
            {/* <SideNavigationBar /> */}
            {!IS_DOM && <SideNavigationBar />}
            <div className="w-full flex flex-col">
              {/* TODO: Migrate to native. */}
              {!IS_DOM && <Header />}

              <div className="flex flex-col p-5 gap-2">{children}</div>
            </div>
          </main>
        </TooltipProvider>
      </DOMRouterProvider>
    </>
  );
}

export default function ShadLayout({
  navigate,
  children,
  select,
}: {
  navigate: typeof import("expo-router").router["navigate"];
  children: React.ReactNode;
  select?: boolean;
}) {
  if (process.env.EXPO_OS === "web" && !IS_DOM) {
    // In standard web, use a partial layout since the shared elements are in the Layout Route.
    return children;
  }

  return (
    <ShadLayoutFull select={select} navigate={navigate} children={children} />
  );
}
