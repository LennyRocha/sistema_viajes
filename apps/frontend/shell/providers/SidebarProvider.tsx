"use client";

import { createContext, type ReactNode } from "react";
import React from "react";
import {
  type SidebarConfig,
  type SidebarProviderValues,
  type SidebarProviderProps,
} from "../../shared/types/SidebarTypes";

const SidebarContext = createContext<
  SidebarProviderValues | undefined
>(undefined);

export function SidebarProvider({
  children,
}: Readonly<SidebarProviderProps>) {
  const [rightSidebarOpen, setRightSidebarOpen] =
    React.useState<boolean>(false);
  const showSidebar = (config: SidebarConfig) => {
    setRightSidebarOpen(true);
    setSidebarTitle(config.title);
    setSidebarChildren(config.children);
  };
  const hideSidebar = () => setRightSidebarOpen(false);
  const [sidebarChildren, setSidebarChildren] =
    React.useState<ReactNode>(null);
  const [sidebarTitle, setSidebarTitle] =
    React.useState<string>("");
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
