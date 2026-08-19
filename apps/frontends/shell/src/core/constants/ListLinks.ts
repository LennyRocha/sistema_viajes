const ListLinks = [
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
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: "group",
    privilege: "usuarios:consultar",
  },
  {
    name: "Servicios",
    href: "/dashboard/services",
    icon: "room_service",
    privilege: "catalogo:consultar",
  },
  {
    name: "Conductores",
    href: "/dashboard/conductores",
    icon: "person", // Material-UI icon
    privilege: "conductores:consultar",
  },
  {
    name: "Bitácora",
    href: "/dashboard/logs",
    icon: "book_4",
    privilege: "bitacora:consultar",
  },
  {
    name: "Rutas",
    href: "/dashboard/routes",
    icon: "pin_road",
    privilege: "calendario:consultar",
  },
  {
    name: "Viajes",
    href: "/dashboard/trips",
    icon: "trip",
    privilege: "calendario:consultar",
  },
  {
    name: "Salidas",
    href: "/dashboard/salidas/programacion",
    icon: "event_available",
    privilege: "salida:consultar",
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: "calendar_month",
    privilege: "calendario:consultar",
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: "bug_report",
    privilege: "reportes:consultar",
  },
  {
    name: "Historial",
    href: "/dashboard/history",
    icon: "history",
    privilege: "historial:consultar",
  },
  {
    name: "Instituciones",
    href: "/dashboard/institutions",
    icon: "account_balance",
    privilege: "catalogo:consultar",
  },
];

export default ListLinks;
