"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../../theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { SidebarProvider } from "./SidebarProvider";
import { DialogProvider } from "./DialogProvider";
import { SnackBox } from "@nexoroute/commons";
import { initFederation } from "@/src/lib/federation";
import PrintSaludo from "../utils/saludo";

initFederation();

export default function ProvidersWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <SidebarProvider>
          <DialogProvider>
            <CssBaseline />
            {children}
            <PrintSaludo />
            <SnackBox />
          </DialogProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
