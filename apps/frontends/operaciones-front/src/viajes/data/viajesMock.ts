import RutaBase from "../types/RutaBase";
import ViajeBase from "../types/ViajeBase";

export const rutasBase: RutaBase[] = [
  {
    id: 1,
    nombre: "Ruta Centro - Universidad",
    descripcion: "Corredor principal de entrada al campus con paradas urbanas de alta demanda.",
    color: "#1f618d",
    estatus: true,
    origen: {
      nombre: "Terminal Centro",
      direccion: "Centro, Cuernavaca, Morelos",
      lat: 18.9242,
      lng: -99.2216,
    },
    destino: {
      nombre: "Campus UTEZ",
      direccion: "Emiliano Zapata, Morelos",
      lat: 18.8505,
      lng: -99.2005,
    },
    paradas: [
      {
        nombre: "Hospital General",
        direccion: "Av. Plan de Ayala, Cuernavaca",
        lat: 18.9141,
        lng: -99.2145,
      },
      {
        nombre: "Jiutepec Centro",
        direccion: "Jiutepec, Morelos",
        lat: 18.8818,
        lng: -99.1776,
      },
    ],
    distanciaKm: 18.4,
    duracionMin: 42,
  },
  {
    id: 2,
    nombre: "Ruta Norte - Parque Industrial",
    descripcion: "Conexion norte para personal administrativo y enlaces con zona industrial.",
    color: "#b7791f",
    estatus: true,
    origen: {
      nombre: "Base Norte",
      direccion: "Col. Buena Vista, Cuernavaca",
      lat: 18.9514,
      lng: -99.2382,
    },
    destino: {
      nombre: "Parque Industrial",
      direccion: "CIVAC, Jiutepec",
      lat: 18.8935,
      lng: -99.1728,
    },
    paradas: [
      {
        nombre: "Glorieta La Luna",
        direccion: "Cuernavaca, Morelos",
        lat: 18.9268,
        lng: -99.2159,
      },
    ],
    distanciaKm: 14.2,
    duracionMin: 35,
  },
  {
    id: 3,
    nombre: "Ruta Sur - Estadio",
    descripcion: "Trayecto sur con cobertura para eventos y salidas especiales.",
    color: "#6b46c1",
    estatus: true,
    origen: {
      nombre: "Base Sur",
      direccion: "Temixco, Morelos",
      lat: 18.8528,
      lng: -99.2254,
    },
    destino: {
      nombre: "Estadio Centenario",
      direccion: "Cuernavaca, Morelos",
      lat: 18.9561,
      lng: -99.2401,
    },
    paradas: [
      {
        nombre: "Plaza Averanda",
        direccion: "Cuernavaca, Morelos",
        lat: 18.9334,
        lng: -99.2017,
      },
    ],
    distanciaKm: 16.8,
    duracionMin: 39,
  },
  {
    id: 4,
    nombre: "Ruta Campus - Terminal Sur",
    descripcion: "Salida de retorno desde campus hacia el corredor sur metropolitano.",
    color: "#2f855a",
    estatus: true,
    origen: {
      nombre: "Campus UTEZ",
      direccion: "Emiliano Zapata, Morelos",
      lat: 18.8505,
      lng: -99.2005,
    },
    destino: {
      nombre: "Terminal Sur",
      direccion: "Temixco, Morelos",
      lat: 18.8528,
      lng: -99.2254,
    },
    paradas: [
      {
        nombre: "Zapata Centro",
        direccion: "Emiliano Zapata, Morelos",
        lat: 18.8387,
        lng: -99.1845,
      },
      {
        nombre: "Acatlipa",
        direccion: "Temixco, Morelos",
        lat: 18.8298,
        lng: -99.2252,
      },
    ],
    distanciaKm: 12.6,
    duracionMin: 31,
  },
];

export const viajesBase: ViajeBase[] = [
  {
    id: 1,
    nombre: "Viaje escolar matutino",
    descripcion:
      "Servicio diario para traslado de alumnos hacia campus.",
    rutas: [rutasBase[0]],
    servicios: ["WiFi", "Aire acondicionado"],
    duracionCalculadaMin: 42,
    margenMin: 8,
    duracionTotalMin: 50,
    config_rutas: [{ id_ruta: 1, estado: "solo-ida" }],
    estatus: true,
  },
  {
    id: 2,
    nombre: "Viaje corporativo CIVAC",
    descripcion:
      "Traslado de personal administrativo hacia zona industrial.",
    rutas: [rutasBase[1], rutasBase[2]],
    servicios: ["Equipaje", "Cargadores USB"],
    duracionCalculadaMin: 74,
    margenMin: 10,
    duracionTotalMin: 84,
    config_rutas: [
      { id_ruta: 2, estado: "solo-ida" },
      { id_ruta: 3, estado: "solo-ida" },
    ],
    estatus: true,
  },
  {
    id: 3,
    nombre: "Viaje especial de eventos",
    descripcion:
      "Configuracion base para salidas especiales programadas.",
    rutas: [rutasBase[2]],
    servicios: ["Pantallas"],
    duracionCalculadaMin: 39,
    margenMin: 15,
    duracionTotalMin: 54,
    config_rutas: [{ id_ruta: 3, estado: "solo-ida" }],
    estatus: false,
  },
  {
    id: 4,
    nombre: "Circuito campus retorno",
    descripcion: "Viaje base armado con rutas conectadas para entrada y retorno operativo.",
    rutas: [rutasBase[0], rutasBase[3]],
    servicios: ["WiFi", "Equipaje", "Cargadores USB"],
    duracionCalculadaMin: 73,
    margenMin: 12,
    duracionTotalMin: 85,
    config_rutas: [
      { id_ruta: 1, estado: "solo-ida" },
      { id_ruta: 4, estado: "solo-ida" },
    ],
    estatus: true,
  },
];
