"use client";

import { PaperBlock, PaperHeader } from "@nexoroute/commons";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GroupsIcon from "@mui/icons-material/Groups";
import MapIcon from "@mui/icons-material/Map";
import RouteIcon from "@mui/icons-material/Route";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useRouter } from "next/navigation";

const modules = [
  {
    title: "Viajes",
    description: "Compone rutas guardadas, valida continuidad y abre salidas en calendario.",
    href: "/dashboard/trips",
    icon: <AltRouteIcon />,
    accent: "#1f618d",
  },
  {
    title: "Rutas",
    description: "Administra trayectos con origen, destino y paradas intermedias.",
    href: "/dashboard/routes",
    icon: <RouteIcon />,
    accent: "#2f855a",
  },
  {
    title: "Autobuses",
    description: "Consulta unidades, configuracion y servicios asignados.",
    href: "/dashboard/buses",
    icon: <DirectionsBusIcon />,
    accent: "#b7791f",
  },
  {
    title: "Instituciones",
    description: "Controla instituciones educativas y su estado operativo.",
    href: "/dashboard/institutions",
    icon: <GroupsIcon />,
    accent: "#6b46c1",
  },
];

export default function DashboardHomeClient() {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <PaperHeader
        title="Panel operativo"
        subtitle="Vista central para coordinar rutas, viajes base, unidades y catalogos del sistema"
        iconname="dashboard"
        showButton
        buttonTitle="Crear viaje"
        leftIcon={<AltRouteIcon />}
        onButtonClick={() => router.push("/dashboard/trips/nuevo")}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(320px, 0.65fr)" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <PaperBlock
          paperProps={{ sx: { minHeight: 430 } }}
          contentWrapperSx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {modules.map((module) => (
            <Box
              key={module.title}
              component="button"
              onClick={() => router.push(module.href)}
              sx={{
                textAlign: "left",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                backgroundColor: "background.paper",
                p: 2,
                cursor: "pointer",
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: module.accent,
                  boxShadow: "0 14px 32px rgba(15, 23, 42, 0.12)",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    backgroundColor: module.accent,
                  }}
                >
                  {module.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {module.title}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
              <Button variant="outlined" size="small" sx={{ alignSelf: "flex-start" }}>
                Abrir modulo
              </Button>
            </Box>
          ))}
        </PaperBlock>

        <PaperBlock
          title="Estado del sistema"
          subtitle="Lectura rapida para operar sin entrar modulo por modulo"
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip icon={<TimelineIcon />} label="Microfrontends listos" color="success" variant="outlined" />
            <Chip icon={<MapIcon />} label="Mapas configurables" color="primary" variant="outlined" />
          </Stack>

          <Divider />

          {[
            ["Viajes base activos", "4"],
            ["Rutas reutilizables", "4"],
            ["Servicios ligados", "5"],
            ["Tolerancia conexion", "100 m"],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.25,
                borderRadius: "8px",
                backgroundColor: "rgba(31, 97, 141, 0.06)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
            </Box>
          ))}

          <Button
            variant="contained"
            color="secondary"
            onClick={() => router.push("/dashboard/trips")}
            startIcon={<AltRouteIcon />}
          >
            Revisar viajes
          </Button>
        </PaperBlock>
      </Box>
    </Box>
  );
}
