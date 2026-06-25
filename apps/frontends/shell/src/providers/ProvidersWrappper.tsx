"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../../theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { SidebarProvider } from "./SidebarProvider";

export default function ProvidersWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <SidebarProvider>
          <CssBaseline />
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
