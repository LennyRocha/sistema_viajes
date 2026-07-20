import { DialogProps } from "./DialogTypes";
import { Router } from "./NextRouterProps";
import { type SidebarConfig } from "./SidebarTypes";
import { SnackFunctionProps } from "./SnackbarProps";

export default interface CommonPageProps {
  navigationFunction: (href: string, options?: any) => void;
  openSidebar: (config: SidebarConfig) => void;
  closeSidebar?: () => void;
  userPrivileges: string[];
  showDialog?: (config: DialogProps) => void;
  snack?: SnackFunctionProps;
  pathname?: string;
  router?: Router;
}
