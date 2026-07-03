import Autobus from "../autobuses/types/Autobus";
import AutobusServicio from "../autobuses/types/AutobusServicio";
import Institucion from "../instituciones/types/Institucion";
import ServicioExterno from "../servicios/types/ServicioExterno";
import TipoAutobus from "../tipos_autobus/types/TipoAutobus";
import AutobusEstado from "../autobuses/types/AutobusEstado";

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
  },
  {
    id: 2,
    nombre: "Ejecutivo Estandar",
    descripcion:
      "Autobús operativo utilizado en la mayoría de rutas y salidas programadas.",
    linea: "Estándar",
  },
  {
    id: 3,
    nombre: "Shuttle ejecutivo",
    descripcion:
      "Unidad auxiliar para transporte ejecutivo, grupos reducidos o rutas cortas.",
    linea: "Shuttle",
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
        tipo: "text",
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
        tipo: "text",
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
    estado: AutobusEstado.DISPONIBLE,
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
      tipo: "text",
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
