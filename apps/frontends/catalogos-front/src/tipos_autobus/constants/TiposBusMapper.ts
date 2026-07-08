import {
  plantillaEstandar,
  plantillaPremium,
  plantillaShuttle,
} from "../../autobuses/constants/asientosPlantilla";

const tiposBus = [
  {
    label: "Premium",
    model: "volkswagen",
    id: 1,
    value: "PREMIUM",
    seats: plantillaPremium,
  },
  {
    label: "Estándar",
    model: "hyundai",
    id: 2,
    value: "ESTANDAR",
    seats: plantillaEstandar,
  },
  {
    label: "Shuttle",
    model: "mercedes",
    id: 3,
    value: "SHUTTLE",
    seats: plantillaShuttle,
  },
] as const;

export default tiposBus;
