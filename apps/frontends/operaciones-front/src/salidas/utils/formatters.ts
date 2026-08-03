import { AutobusResumen, ConductorResumen } from "../types/SalidasApi";
import { VehicleModelName } from "../../viajes/components/VehicleModelPreview";

export const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";

export function formatDuration(minutes?: number | null) {
  const value = Number(minutes || 0);
  if (value <= 0) return "Sin calcular";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins ? `${hours} h ${mins} min` : `${hours} h`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);
}

export function fullDriverName(driver?: ConductorResumen | null) {
  if (!driver) return "Sin conductor";
  return [
    driver.nombres,
    driver.apellido_paterno,
    driver.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
}

export function vehicleModelFromBus(bus?: AutobusResumen | null): VehicleModelName {
  const text = `${bus?.marca || ""} ${bus?.modelo || ""} ${bus?.tipoAutobus?.nombre || ""}`.toLowerCase();
  if (text.includes("mercedes") || text.includes("sprinter")) return "mercedes";
  if (text.includes("volks") || text.includes("crafter")) return "volkswagen";
  return "hyundai";
}
