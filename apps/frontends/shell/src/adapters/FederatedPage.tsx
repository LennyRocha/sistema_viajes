"use client";
import { useDialog } from "../providers/DialogProvider";
import { useSidebar } from "../providers/SidebarProvider";
import {
  usePathname,
  useRouter,
} from "next/dist/client/components/navigation";
import { snack } from "@nexoroute/commons";
import { federatedComponent } from "../lib/loadRemote";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

type Props = {
  remote: string;
  exportName: string;
  skeletonVariant: MainSkeletonVariants;
  params?: Record<string, string | string[] | undefined>;
};

const FederatedPage = ({
  params,
  remote,
  exportName,
  skeletonVariant = "table",
}: Props) => {
  const router = useRouter();
  const { showSidebar, hideSidebar } = useSidebar();
  const { showDialog } = useDialog();
  const pathname = usePathname();
  const props = {
    navigationFunction: router.push,
    openSidebar: showSidebar,
    closeSidebar: hideSidebar,
    userPrivileges: [],
    showDialog: showDialog,
    snack,
    pathname,
    router,
    userRoles: [],
    ...params,
  };
  const Componente = federatedComponent(
    remote,
    exportName,
    skeletonVariant,
  );
  return <Componente {...props} />;
};

export default FederatedPage;
