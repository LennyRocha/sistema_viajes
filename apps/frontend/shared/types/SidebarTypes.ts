import { type ReactNode } from "react";

export type SidebarConfig = {
  title: string;
  children: ReactNode;
};

export type SidebarProviderValues = {
  rightSidebarOpen: boolean;
  showSidebar: (config: SidebarConfig) => void;
  hideSidebar: () => void;
  sidebarChildren?: ReactNode;
  setSidebarChildren: (children: ReactNode) => void;
  sidebarTitle?: string;
  setSidebarTitle: (title: string) => void;
};

export type SidebarProviderProps = {
  children?: ReactNode;
};
