import RutaBase from "../types/RutaBase";
import ViajeBase from "../types/ViajeBase";

export const rutasBase: RutaBase[] = [
  {
    id: 1,
    nombre: "Ruta Centro - Universidad",
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
];

export const viajesBase: ViajeBase[] = [
  {
    id: 1,
    nombre: "Viaje escolar matutino",
    descripcion:
      "Servicio diario para traslado de alumnos hacia campus.",
    rutas: [rutasBase[0]],
    servicios: ["WiFi", "Aire acondicionado"],
    frecuencia: "Lunes a viernes",
    proximaApertura: "2026-07-06 06:30",
    estatus: true,
  },
  {
    id: 2,
    nombre: "Viaje corporativo CIVAC",
    descripcion:
      "Traslado de personal administrativo hacia zona industrial.",
    rutas: [rutasBase[1], rutasBase[2]],
    servicios: ["Equipaje", "Cargadores USB"],
    frecuencia: "Lunes, miercoles y viernes",
    proximaApertura: "2026-07-06 07:15",
    estatus: true,
  },
  {
    id: 3,
    nombre: "Viaje especial de eventos",
    descripcion:
      "Configuracion base para salidas especiales programadas.",
    rutas: [rutasBase[2]],
    servicios: ["Pantallas"],
    frecuencia: "Bajo demanda",
    proximaApertura: "Sin programar",
    estatus: false,
  },
];
