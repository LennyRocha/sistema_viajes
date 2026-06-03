import {
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
  Badge,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DynamicIcon from "../icons/DynamicIcon";
import ListLinks from "@/core/constants/ListLinks";

type Props = {
  isInDrawer?: boolean;
};

export default function NavSidebarContent({
  isInDrawer = false,
}: Readonly<Props>) {
  return (
    <Box
      component={"div"}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    >
      {!isInDrawer && (
        <Box
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: "8px",
            width: "100%",
          }}
        >
          <Typography variant="h5" className="font-brand">
            Nexoroute
          </Typography>
          <Box
            component="div"
            sx={{
              display: "flex",
              width: "fit-content",
            }}
          >
            <Badge color="error" variant="dot">
              <IconButton
                aria-label="notifications"
                size="small"
                color="inherit"
              >
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <IconButton
              aria-label="options"
              size="small"
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      <Avatar
        alt="profile picture"
        sx={{ width: 120, height: 120, margin: "0 auto" }}
        src="/assets/placeholder.png"
      />
      <Typography
        variant="h6"
        sx={{
          width: "100%",
          textAlign: "center",
        }}
      >
        Juan Pérez
      </Typography>
      <Typography
        variant="body1"
        sx={{
          width: "100%",
          textAlign: "center",
        }}
        color="textSecondary"
      >
        Rol actual
      </Typography>
      <List
        sx={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {ListLinks.map((l) => (
          <ListItem key={l.name} disablePadding>
            <ListItemButton
              sx={{
                color: "text.primary",
                borderEndEndRadius: 4,
                borderStartEndRadius: 4,
                "&:hover": {
                  backgroundColor: "background.paper",
                  color: "secondary.main",
                },
                "&.Mui-selected": {
                  backgroundColor: "accent.light",
                  color: "primary.main",
                  borderLeft: "4px solid",
                  borderColor: "primary.dark",
                  "&:hover": {
                    backgroundColor: "border.main",
                    color: "text.secondary",
                    borderColor: "text.secondary",
                  },
                },
              }}
              selected={l.name === "Inicio"}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                }}
              >
                <DynamicIcon name={l.icon} filled={true} />
              </ListItemIcon>
              <ListItemText primary={l.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
