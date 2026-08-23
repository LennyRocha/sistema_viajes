"use client";

import {
  AppBar,
  useMediaQuery,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import MenuIcon from "@mui/icons-material/Menu";
import { Close } from "@mui/icons-material";
import {
  MotionPaper,
  NavDrawer,
  OptionsDrawer,
  NavSidebarContent,
  DrawerOptionsMenu,
} from "@nexoroute/commons";
import { useSidebar } from "../providers/SidebarProvider";
import ListLinks from "../core/constants/ListLinks";
import { usePathname, useRouter } from "next/navigation";
import NextLinkForCommons from "../adapters/NextLinkForCommons";
import DrawerMenuHandlers from "../core/constants/DrawerMenuHandlers";

export default function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLargeScreen = useMediaQuery("(max-width:1024px)");
  const [leftDrawerOpen, setLeftDrawerOpen] =
    React.useState<boolean>(false);
  const openLeftDrawer = () => setLeftDrawerOpen(true);
  const closeLeftDrawer = () => setLeftDrawerOpen(false);
  const sidebar = useSidebar();
  const [sessionUser, setSessionUser] = React.useState<any>(null);
  const [sessionResolved, setSessionResolved] = React.useState(false);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("nexoroute.user");
      setSessionUser(stored ? JSON.parse(stored) : null);
    } catch {
      setSessionUser(null);
    } finally {
      setSessionResolved(true);
    }
  }, []);
  const userRoles = Array.isArray(sessionUser?.roles) ? sessionUser.roles : [];
  const userPrivileges = Array.isArray(sessionUser?.privileges) ? sessionUser.privileges : [];
  const operationalRoles = [
    "ROLE_ADMIN",
    "ROLE_OPERADOR",
    "ROLE_SUPERVISOR",
    "ROLE_CONDUCTOR",
  ];
  const isOperationalUser = userRoles.some((role: string) => operationalRoles.includes(role));
  React.useEffect(() => {
    if (!sessionResolved) return;
    if (!sessionUser) {
      router.replace("/login");
      return;
    }
    if (!isOperationalUser) {
      router.replace("/");
    }
  }, [isOperationalUser, router, sessionResolved, sessionUser]);
  const canSee = (link: (typeof ListLinks)[number]) => {
    if (userRoles.includes("ROLE_ADMIN")) return true;
    if (link.allowedRoles && !link.allowedRoles.some((role) => userRoles.includes(role))) {
      return false;
    }
    const privileges = link.privileges ?? (link.privilege ? [link.privilege] : []);
    return privileges.length === 0 || privileges.some((privilege) => userPrivileges.includes(privilege));
  };
  const userData = {
    name: `${sessionUser?.nombres ?? ""} ${sessionUser?.apellido_paterno ?? ""}`.trim() || "Usuario",
    role: userRoles.join(", ") || "Sin rol",
    links: ListLinks.filter(canSee),
    img: sessionUser?.foto_perfil || "/assets/placeholder.png",
  };
  React.useEffect(() => {
    if (!isLargeScreen && leftDrawerOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      closeLeftDrawer();
    }
  }, [isLargeScreen, leftDrawerOpen]);
  React.useEffect(() => {
    sidebar.hideSidebar();
  }, [pathname]);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  if (!sessionResolved || !sessionUser || !isOperationalUser) return null;

  return (
    <main id="layout_main">
      {/* Header */}
      {isLargeScreen && (
        <AppBar
          position="static"
          color="primary"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            flexDirection: "row",
            backgroundColor: "transparent",
          }}
          elevation={0}
        >
          <Typography
            variant="h5"
            className="font-brand"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="menu"
              size="large"
              onClick={() => openLeftDrawer()}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            Nexoroute
          </Typography>
          <Box
            component="div"
            sx={{ display: "inline-flex" }}
          >
            <DrawerOptionsMenu
              onCerrarSesionClick={
                DrawerMenuHandlers.onCerrarSesionClick
              }
            />
          </Box>
        </AppBar>
      )}
      <motion.div id="main">
        {/* Sidebar de navegación */}
        <aside className="left_sidebar">
          <NavSidebarContent
            user={userData}
            LinkComponent={NextLinkForCommons as any}
            pathname={pathname}
            drawerCallbacks={DrawerMenuHandlers}
          />
        </aside>
        {/* Contenido principal */}
        <AnimatePresence>
          <motion.section id="content">
            <div className=" h-full overflow-y-auto w-full overflow-x-hidden flex flex-col gap-[10px] p-[4px]">
              {children}
            </div>
          </motion.section>
        </AnimatePresence>
        {/* Sidebar para navegación en mobile */}
        <AnimatePresence>
          {!isLargeScreen && (
            <MotionPaper
              className="right_sidebar"
              elevation={3}
              sx={{
                height: "100%",
              }}
              initial={{
                display: "none",
                width: 0,
                opacity: 0,
              }}
              animate={
                sidebar.rightSidebarOpen
                  ? {
                      display: "flex",
                      width: 248,
                      opacity: 1,
                    }
                  : {
                      display: "none",
                      width: 0,
                      opacity: 0,
                    }
              }
              exit={{
                display: "none",
                width: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              onAnimationComplete={() => {
                if (
                  sidebar.rightSidebarOpen &&
                  sidebarRef.current
                ) {
                  sidebarRef.current.scrollTo({
                    top: 0,
                    behavior: "instant",
                  });
                }
              }}
            >
              <Box component={"div"}>
                <Button
                  onClick={sidebar.hideSidebar}
                  startIcon={
                    <Close
                      sx={{
                        width: "fit-content",
                        alignContent: "start",
                      }}
                    />
                  }
                  color="inherit"
                >
                  Cerrar
                </Button>
              </Box>
              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: "700" }}
              >
                {sidebar.sidebarTitle}
              </Typography>
              <Box
                component={"article"}
                sx={{
                  overflowY: "auto",
                  flex: 1,
                  minHeight: 0,
                }}
                ref={sidebarRef}
              >
                {sidebar.sidebarChildren}
              </Box>
            </MotionPaper>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Drawers para mobile */}
      <NavDrawer
        leftDrawerOpen={leftDrawerOpen}
        setLeftDrawerOpen={setLeftDrawerOpen}
        closeLeftDrawer={closeLeftDrawer}
        user={userData}
        LinkComponent={NextLinkForCommons}
        pathname={pathname}
        drawerCallbacks={DrawerMenuHandlers}
      />
      {/* Drawer para sidebar dinámico en mobile */}
      <OptionsDrawer
        sidebar={sidebar}
        isLargeScreen={isLargeScreen}
      />
    </main>
  );
}
