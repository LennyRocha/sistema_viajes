import Autobus from "../autobuses/types/Autobus";
import AutobusServicio from "../autobuses/types/AutobusServicio";
import Institucion from "../instituciones/types/Institucion";
import ServicioExterno from "../servicios/types/ServicioExterno";
import TipoAutobus from "../tipos_autobus/types/TipoAutobus";
import AutobusEstado from "../autobuses/types/AutobusEstado";
import Conductor from "../conductores/types/Conductor";
import ConductorEstado from "../conductores/types/ConductorEstado";

export const instituciones: Institucion[] = [
  {
    id: 1,
    nombre: "Transportes del Norte",
    descripcion: "Servicio regional de transporte",
    estatus: true,
  },
  {
    id: 2,
    nombre: "Movilidad Express",
    descripcion: "Transporte ejecutivo y turístico",
    estatus: true,
  },
  {
    id: 3,
    nombre: "Autobuses Sierra",
    descripcion: "Rutas de montaña",
    estatus: true,
  },
  {
    id: 4,
    nombre: "Viajes Premium",
    descripcion: "Servicio de lujo",
    estatus: true,
  },
  {
    id: 5,
    nombre: "Ruta Escolar",
    descripcion: "Transporte escolar",
    estatus: false,
  },
];

export const tiposAutobus: TipoAutobus[] = [
  {
    id: 1,
    nombre: "Ejecutivo Premium",
    descripcion:
      "Autobús de lujo utilizado para viajes largos y servicios preferenciales.",
    linea: "Premium",
    capacidad: 36,
  },
  {
    id: 2,
    nombre: "Ejecutivo Estandar",
    descripcion:
      "Autobús operativo utilizado en la mayoría de rutas y salidas programadas.",
    linea: "Estándar",
    capacidad: 44,
  },
  {
    id: 3,
    nombre: "Shuttle ejecutivo",
    descripcion:
      "Unidad auxiliar para transporte ejecutivo, grupos reducidos o rutas cortas.",
    linea: "Shuttle",
    capacidad: 24,
  },
];

export const servicios: ServicioExterno[] = [
  {
    id: 1,
    nombre: "WiFi",
    icono_nombre: "wifi",
    descripcion:
      "Servicio de conexión inalámbrica a internet para los pasajeros.",
    estatus: true,
    propiedades: [
      {
        clave: "nombre_red",
        label: "Nombre de red",
        tipo: "string",
        requerido: true,
        placeholder: "Ej. Bus_Norte_01",
      },
      {
        clave: "velocidad",
        label: "Velocidad Mbps",
        tipo: "number",
        min: 1,
        max: 1000,
      },
    ],
    disponibilidad: [],
  },

  {
    id: 2,
    nombre: "Equipaje",
    icono_nombre: "luggage",
    descripcion:
      "Servicio de almacenamiento de equipaje para los pasajeros.",
    estatus: true,
    propiedades: [
      {
        clave: "capacidad",
        label: "Capacidad máxima (kg)",
        tipo: "number",
        requerido: true,
        min: 1,
      },
    ],
    disponibilidad: [],
  },

  {
    id: 3,
    nombre: "Aire acondicionado",
    icono_nombre: "ac_unit",
    descripcion:
      "Servicio de climatización para los pasajeros.",
    estatus: true,
    propiedades: [
      {
        clave: "temperatura",
        label: "Temperatura configurada",
        tipo: "number",
        min: 15,
        max: 30,
      },
      {
        clave: "automatico",
        label: "Modo automático",
        tipo: "boolean",
        inputTipo: "switch",
      },
    ],
    disponibilidad: [],
  },

  {
    id: 4,
    nombre: "Pantallas",
    icono_nombre: "tv",
    descripcion:
      "Servicio de visualización de contenido para los pasajeros.",
    estatus: true,
    propiedades: [
      {
        clave: "cantidad",
        label: "Cantidad de pantallas",
        tipo: "number",
        min: 1,
      },
      {
        clave: "contenido",
        label: "Contenido mostrado",
        tipo: "string",
        inputTipo: "textarea",
      },
    ],
    disponibilidad: [],
  },

  {
    id: 5,
    nombre: "Cargadores USB",
    icono_nombre: "usb",
    descripcion:
      "Servicio de carga de dispositivos electrónicos para los pasajeros.",
    estatus: true,
    propiedades: [
      {
        clave: "puertos",
        label: "Número de puertos",
        tipo: "number",
        min: 1,
      },
    ],
    disponibilidad: [],
  },
];

export const autobuses: Autobus[] = [
  {
    id: 1,
    institucion: instituciones[0],
    tipo: tiposAutobus[0],
    alias: "NORTE-001",
    marca: "Mercedes Benz",
    modelo: "Tourismo",
    descripcion: "Unidad principal",
    ano: 2023,
    capacidad: 45,
    color: "Blanco",
    codigo_interno: "MB-001",
    estado: AutobusEstado.DISPONIBLE,
    estatus: true,
  },

  {
    id: 2,
    institucion: instituciones[1],
    tipo: tiposAutobus[1],
    alias: "PREMIUM-01",
    marca: "Volvo",
    modelo: "9700",
    descripcion: "Unidad ejecutiva",
    ano: 2024,
    capacidad: 40,
    color: "Negro",
    codigo_interno: "V-9700",
    estado: AutobusEstado.ENVIAJE,
    estatus: true,
  },

  {
    id: 3,
    institucion: instituciones[2],
    tipo: tiposAutobus[2],
    alias: "SIERRA-10",
    marca: "Scania",
    modelo: "K450",
    descripcion: "Ruta montañosa",
    ano: 2022,
    capacidad: 50,
    color: "Azul",
    codigo_interno: "SC-450",
    estado: AutobusEstado.MANTENIMIENTO,
    estatus: true,
  },

  {
    id: 4,
    institucion: instituciones[3],
    tipo: tiposAutobus[1],
    alias: "VIP-02",
    marca: "Irizar",
    modelo: "i8",
    descripcion: "Autobús VIP",
    ano: 2025,
    capacidad: 36,
    color: "Gris",
    codigo_interno: "IR-008",
    estado: AutobusEstado.FUERASERVICIO,
    estatus: true,
  },

  {
    id: 5,
    institucion: instituciones[4],
    tipo: tiposAutobus[0],
    alias: "ESC-05",
    marca: "Dina",
    modelo: "Runner",
    descripcion: "Transporte escolar",
    ano: 2021,
    capacidad: 30,
    color: "Amarillo",
    codigo_interno: "DN-05",
    estado: AutobusEstado.FUERASERVICIO,
    estatus: false,
  },
];

export const autobusServicios: AutobusServicio[] = [
  {
    id: 1,
    autobusId: 1,
    servicioId: 1,
    activo: true,
    configuracion_servicio: {
      clave: "nombre_red",
      label: "Nombre de red",
      tipo: "string",
      requerido: true,
      placeholder: "Ej. Autobus_WIFI",
    },
  },

  {
    id: 2,
    autobusId: 1,
    servicioId: 2,
    activo: true,
    configuracion_servicio: {
      clave: "capacidad",
      label: "Capacidad de equipaje",
      tipo: "number",
      requerido: true,
      min: 1,
    },
  },

  {
    id: 3,
    autobusId: 2,
    servicioId: 3,
    activo: true,
    configuracion_servicio: {
      clave: "temperatura",
      label: "Temperatura",
      tipo: "number",
      min: 15,
      max: 30,
    },
  },

  {
    id: 4,
    autobusId: 3,
    servicioId: 4,
    activo: true,
    configuracion_servicio: {
      clave: "cantidad",
      label: "Número de pantallas",
      tipo: "number",
      min: 1,
    },
  },

  {
    id: 5,
    autobusId: 4,
    servicioId: 5,
    activo: true,
    configuracion_servicio: {
      clave: "cantidad_puertos",
      label: "Cantidad de puertos USB",
      tipo: "number",
      min: 1,
    },
  },
];

export const conductores: Conductor[] = [
  {
    id: 1,
    institucion: instituciones[0],
    nombre: "Carlos",
    apellido: "González",
    curp: "GOGC850315HDFNRS09",
    telefono: "+34 612 345 678",
    email: "carlos.gonzalez@transportes.com",
    fecha_nacimiento: "1985-03-15",
    licencia: {
      id: 1,
      numeroLicencia: "LIC-2024-001",
      fechaExpedicion: new Date("2020-06-10"),
      fechaVencimiento: new Date("2026-06-10"),
      telefono: "+34 612 345 678",
      estadoEmisor: "Madrid",
      imagenLicencia: "https://example.com/licencia1.jpg",
    },
    estado: ConductorEstado.ACTIVO,
    fotoPerfil: "https://example.com/foto1.jpg",
  },
  {
    id: 2,
    institucion: instituciones[1],
    nombre: "María",
    apellido: "López",
    curp: "LOPM890722HDFNRS08",
    telefono: "+34 612 345 679",
    email: "maria.lopez@transportes.com",
    fecha_nacimiento: "1989-07-22",
    licencia: {
      id: 2,
      numeroLicencia: "LIC-2024-002",
      fechaExpedicion: new Date("2021-03-05"),
      fechaVencimiento: new Date("2027-03-05"),
      telefono: "+34 612 345 679",
      estadoEmisor: "Barcelona",
      imagenLicencia: "https://example.com/licencia2.jpg",
    },
    estado: ConductorEstado.ACTIVO,
    fotoPerfil: "https://example.com/foto2.jpg",
  },
  {
    id: 3,
    institucion: instituciones[2],
    nombre: "Juan",
    apellido: "Martínez",
    curp: "MAJR810914HDFNRS07",
    telefono: "+34 612 345 680",
    email: "juan.martinez@transportes.com",
    fecha_nacimiento: "1981-09-14",
    licencia: {
      id: 3,
      numeroLicencia: "LIC-2024-003",
      fechaExpedicion: new Date("2019-01-20"),
      fechaVencimiento: new Date("2025-01-20"),
      telefono: "+34 612 345 680",
      estadoEmisor: "Valencia",
      imagenLicencia: "https://example.com/licencia3.jpg",
    },
    estado: ConductorEstado.ACTIVO,
    fotoPerfil: "https://example.com/foto3.jpg",
  },
  {
    id: 4,
    institucion: instituciones[3],
    nombre: "Pedro",
    apellido: "Rodríguez",
    curp: "RORP920505HDFNRS06",
    telefono: "+34 612 345 681",
    email: "pedro.rodriguez@transportes.com",
    fecha_nacimiento: "1992-05-05",
    licencia: {
      id: 4,
      numeroLicencia: "LIC-2024-004",
      fechaExpedicion: new Date("2022-11-15"),
      fechaVencimiento: new Date("2028-11-15"),
      telefono: "+34 612 345 681",
      estadoEmisor: "Sevilla",
      imagenLicencia: "https://example.com/licencia4.jpg",
    },
    estado: ConductorEstado.INACTIVO,
    fotoPerfil: "https://example.com/foto4.jpg",
  },
];
