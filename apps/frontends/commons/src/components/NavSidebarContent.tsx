"use client";

import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
} from "@mui/material";
import DynamicIcon from "../icons/DynamicIcon";
import DrawerOptionsMenu from "../drawers/DrawerOptionsMenu";
import NotificationsButton from "../drawers/NotificationsButton";
import SidebarUserData from "../types/SidebarUserData";
import { ElementType } from "react";

type Props = {
  isInDrawer?: boolean;
  user: SidebarUserData;
  pathname?: string;
  LinkComponent: ElementType;
};

export default function NavSidebarContent({
  isInDrawer = false,
  user,
  pathname,
  LinkComponent = "a",
}: Readonly<Props>) {
  const isActive = (path?: string, href?: string) =>
    path === href || path?.startsWith(href + "/");
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
            <NotificationsButton />
            <DrawerOptionsMenu />
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
        {user.name}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          width: "100%",
          textAlign: "center",
        }}
        color="textSecondary"
      >
        {user.role}
      </Typography>
      <List
        sx={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {user.links.map((l) => (
          <ListItem key={l.name} disablePadding>
            <ListItemButton
              component={LinkComponent}
              href={l.href}
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
              selected={isActive(pathname, l.href)}
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
