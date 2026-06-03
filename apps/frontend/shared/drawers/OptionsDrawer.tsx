import {
  Box,
  Button,
  Drawer,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { type SidebarProviderValues } from "../types/SidebarTypes";

type Props = {
  sidebar: SidebarProviderValues;
  isLargeScreen: boolean;
};

export default function OptionsDrawer({
  sidebar,
  isLargeScreen,
}: Readonly<Props>) {
  return (
    <Drawer
      open={sidebar.rightSidebarOpen && isLargeScreen}
      onClose={sidebar.hideSidebar}
      anchor="right"
      sx={{
        "& .MuiDrawer-paper": {
          width: 248,
        },
      }}
    >
      <Box
        component={"aside"}
        sx={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
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
        {sidebar.sidebarChildren}
      </Box>
    </Drawer>
  );
}
