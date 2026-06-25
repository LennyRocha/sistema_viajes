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
  NotificationsButton,
} from "@nexoroute/commons";
import { useSidebar } from "../providers/SidebarProvider";
import sampleUserData from "../core/constants/sampleUserData";
import { usePathname } from "next/navigation";
import NextLinkForCommons from "../adapters/NextLinkForCommons";

export default function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLargeScreen = useMediaQuery("(max-width:1024px)");
  const [leftDrawerOpen, setLeftDrawerOpen] =
    React.useState<boolean>(false);
  const openLeftDrawer = () => setLeftDrawerOpen(true);
  const closeLeftDrawer = () => setLeftDrawerOpen(false);
  const sidebar = useSidebar();
  React.useEffect(() => {
    if (!isLargeScreen && leftDrawerOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      closeLeftDrawer();
    }
  }, [isLargeScreen, leftDrawerOpen]);
  return (
    <main>
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
            <DrawerOptionsMenu />
            <NotificationsButton />
          </Box>
        </AppBar>
      )}
      <motion.div id="main">
        {/* Sidebar de navegación */}
        <aside className="left_sidebar">
          <NavSidebarContent
            user={sampleUserData}
            LinkComponent={NextLinkForCommons as any}
            pathname={pathname}
          />
        </aside>
        {/* Contenido principal */}
        <AnimatePresence>
          <motion.section id="content">
            <div className=" h-full overflow-y-auto w-full overflow-x-hidden flex flex-col gap-[10px]">
              {children}
            </div>
          </motion.section>
        </AnimatePresence>
        {/* Sidebar para navegación en mobile */}
        <AnimatePresence>
          {sidebar.rightSidebarOpen && !isLargeScreen && (
            <MotionPaper
              className="right_sidebar"
              elevation={3}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 248, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
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
                component={"div"}
                sx={{
                  overflowY: "auto",
                  flex: 1,
                }}
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
        user={sampleUserData}
        LinkComponent={NextLinkForCommons}
        pathname={pathname}
      />
      {/* Drawer para sidebar dinámico en mobile */}
      <OptionsDrawer
        sidebar={sidebar}
        isLargeScreen={isLargeScreen}
      />
    </main>
  );
}
