"use client";

import { Drawer, Box, Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import NavSidebarContent from "../components/NavSidebarContent";
import SidebarUserData from "../types/SidebarUserData";

type Props = {
  leftDrawerOpen: boolean;
  setLeftDrawerOpen: (open: boolean) => void;
  closeLeftDrawer: () => void;
  user: SidebarUserData;
  LinkComponent: React.ElementType;
  pathname?: string;
};

export default function NavDrawer({
  leftDrawerOpen,
  setLeftDrawerOpen,
  closeLeftDrawer,
  user,
  LinkComponent,
  pathname,
}: Readonly<Props>) {
  return (
    <Drawer
      open={leftDrawerOpen}
      onClose={() => setLeftDrawerOpen(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 248,
        },
      }}
    >
      <Box
        component={"aside"}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Box component={"div"}>
          <Button
            onClick={closeLeftDrawer}
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
        <NavSidebarContent
          isInDrawer
          user={user}
          LinkComponent={LinkComponent}
          pathname={pathname}
        />
      </Box>
    </Drawer>
  );
}
