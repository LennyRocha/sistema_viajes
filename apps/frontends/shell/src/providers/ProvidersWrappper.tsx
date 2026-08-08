"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../../theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { SidebarProvider } from "./SidebarProvider";
import { DialogProvider } from "./DialogProvider";
import { SnackBox } from "@nexoroute/commons";
import { initFederation } from "@/src/lib/federation";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrintSaludo from "../utils/saludo";
import { SalidaProvider } from "./ViajeProvider";

initFederation();

export default function ProvidersWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme} defaultMode="system">
        <SidebarProvider>
          <DialogProvider>
            <SalidaProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
              >
                {children}
                <CssBaseline />
              </LocalizationProvider>
              <PrintSaludo />
              <SnackBox />
            </SalidaProvider>
          </DialogProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
