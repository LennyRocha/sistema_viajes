import { type SidebarConfig } from "./SidebarTypes";

export default interface CommonPageProps {
  navigationFunction: () => void;
  openSidebar: (config: SidebarConfig) => void;
  userPrivileges: string[];
}
