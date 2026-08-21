"use client";
import { useEffect, useMemo, useState } from "react";
import { useDialog } from "../providers/DialogProvider";
import { useSidebar } from "../providers/SidebarProvider";
import {
  usePathname,
  useRouter,
} from "next/dist/client/components/navigation";
import { EmptyState, hasAnyPrivilege, snack } from "@nexoroute/commons";
import { federatedComponent } from "../lib/loadRemote";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

type Props = {
  remote: string;
  exportName: string;
  skeletonVariant: MainSkeletonVariants;
  params?: Record<string, string | string[] | undefined>;
  requiredPrivileges?: string[];
  allowedRoles?: string[];
};

type SessionUser = {
  roles?: string[];
  privileges?: string[];
};

const FederatedPage = ({
  params,
  remote,
  exportName,
  skeletonVariant = "table",
  requiredPrivileges = [],
  allowedRoles = [],
}: Props) => {
  const router = useRouter();
  const { showSidebar, hideSidebar } = useSidebar();
  const { showDialog } = useDialog();
  const pathname = usePathname();

  const [sessionUser, setSessionUser] = useState<SessionUser>({});
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    try {
      setSessionUser(
        JSON.parse(localStorage.getItem("nexoroute.user") || "{}"),
      );
    } catch {
      setSessionUser({});
    }
    setSessionLoaded(true);
  }, []);

  const Componente = useMemo(
    () => federatedComponent(remote, exportName, skeletonVariant),
    [remote, exportName, skeletonVariant],
  );

  const props = {
    navigationFunction: router.push,
    openSidebar: showSidebar,
    closeSidebar: hideSidebar,
    userPrivileges: sessionUser.privileges ?? [],
    showDialog: showDialog,
    snack,
    pathname,
    router,
    userRoles: sessionUser.roles ?? [],
    ...params,
  };

  if (!sessionLoaded) {
    return null;
  }

  const isAdmin = sessionUser.roles?.includes("ROLE_ADMIN");
  const hasAllowedRole =
    allowedRoles.length === 0 ||
    isAdmin ||
    allowedRoles.some((role) => sessionUser.roles?.includes(role));
  const hasRequiredPrivilege =
    requiredPrivileges.length === 0 ||
    hasAnyPrivilege(
      sessionUser.privileges,
      sessionUser.roles,
      requiredPrivileges,
    );

  if (!hasAllowedRole || !hasRequiredPrivilege) {
    return (
      <EmptyState
        variant="forbidden"
        title="Acceso restringido"
        description="Tu rol no tiene privilegios para realizar esta acción."
        action={{
          label: "Volver al inicio",
          onClick: () => router.replace("/dashboard"),
        }}
        fullHeight
      />
    );
  }

  return <Componente {...props} />;
};

export default FederatedPage;
