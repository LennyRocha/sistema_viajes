type NavigationLink = {
  name: string;
  href: string;
  icon: string;
  privilege?: string;
  privileges?: string[];
  allowedRoles?: string[];
};

const ListLinks: NavigationLink[] = [
  {
    name: "Inicio",
    href: "/dashboard/",
    icon: "home",
  },
  {
    name: "Autobuses",
    href: "/dashboard/buses",
    icon: "directions_bus",
    privilege: "autobus:consultar",
    allowedRoles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: "group",
    privilege: "usuarios:consultar",
    allowedRoles: ["ROLE_ADMIN"],
  },
  {
    name: "Servicios",
    href: "/dashboard/services",
    icon: "room_service",
    privilege: "servicio:consultar",
    allowedRoles: ["ROLE_ADMIN"],
  },
  {
    name: "Conductores",
    href: "/dashboard/conductores",
    icon: "person", // Material-UI icon
    privilege: "conductores:consultar",
    allowedRoles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
  },
  {
    name: "Rutas",
    href: "/dashboard/routes",
    icon: "pin_road",
    privilege: "ruta:consultar",
    allowedRoles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
  },
  {
    name: "Viajes",
    href: "/dashboard/trips",
    icon: "trip",
    privilege: "viaje-base:consultar",
    allowedRoles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
  },
  {
    name: "Salidas",
    href: "/dashboard/salidas",
    icon: "event_available",
    privileges: ["salida:consultar", "salida:consultar-propias"],
    allowedRoles: ["ROLE_ADMIN", "ROLE_OPERADOR", "ROLE_SUPERVISOR", "ROLE_CONDUCTOR"],
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: "calendar_month",
    privileges: ["calendario:consultar", "calendario:consultar-propio"],
    allowedRoles: ["ROLE_ADMIN", "ROLE_OPERADOR", "ROLE_SUPERVISOR", "ROLE_CONDUCTOR"],
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: "assessment",
    privilege: "bitacora:consultar",
    allowedRoles: ["ROLE_ADMIN"],
  },
  {
    name: "Historial",
    href: "/dashboard/history",
    icon: "history",
    privilege: "historial:consultar",
    allowedRoles: ["ROLE_ADMIN"],
  },
  {
    name: "Instituciones",
    href: "/dashboard/institutions",
    icon: "account_balance",
    privilege: "catalogo:administrar",
    allowedRoles: ["ROLE_ADMIN"],
  },
];

export default ListLinks;
