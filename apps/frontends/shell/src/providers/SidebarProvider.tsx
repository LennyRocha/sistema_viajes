"use client";

import {
  createContext,
  useEffect,
  type ReactNode,
} from "react";
import React from "react";
import {
  type SidebarConfig,
  type SidebarProviderValues,
  type SidebarProviderProps,
} from "@nexoroute/commons";

const SidebarContext = createContext<
  SidebarProviderValues | undefined
>(undefined);

export function SidebarProvider({
  children,
}: Readonly<SidebarProviderProps>) {
  const [rightSidebarOpen, setRightSidebarOpen] =
    React.useState<boolean>(false);
  const showSidebar = (config: SidebarConfig) => {
    if (rightSidebarOpen) {
      setRightSidebarOpen(false);
      setTimeout(() => {
        setRightSidebarOpen(true);
        setSidebarTitle(config.title);
        setSidebarChildren(config.children);
      }, 250);
    } else {
      setRightSidebarOpen(true);
      setSidebarTitle(config.title);
      setSidebarChildren(config.children);
    }
  };
  const hideSidebar = () => setRightSidebarOpen(false);
  const [sidebarChildren, setSidebarChildren] =
    React.useState<ReactNode>(null);
  const [sidebarTitle, setSidebarTitle] =
    React.useState<string>("");
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") hideSidebar();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, []);
  const contextValue = React.useMemo(
    () => ({
      rightSidebarOpen,
      showSidebar,
      hideSidebar,
      sidebarChildren,
      setSidebarChildren,
      setSidebarTitle,
      sidebarTitle,
    }),
    [sidebarChildren, rightSidebarOpen, sidebarTitle],
  );
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebar must be used within SidebarProvider",
    );
  }
  return context;
}
