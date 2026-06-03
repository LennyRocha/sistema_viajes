import { Drawer, Box, Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import NavSidebarContent from "../components/NavSidebarContent";

type Props = {
  leftDrawerOpen: boolean;
  setLeftDrawerOpen: (open: boolean) => void;
  closeLeftDrawer: () => void;
};

export default function NavDrawer({
  leftDrawerOpen,
  setLeftDrawerOpen,
  closeLeftDrawer,
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
        <NavSidebarContent isInDrawer />
      </Box>
    </Drawer>
  );
}
