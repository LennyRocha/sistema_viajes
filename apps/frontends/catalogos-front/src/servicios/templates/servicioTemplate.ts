import { ServicioSchema } from "../validations/servicioZod";

export const servicioTemplate: ServicioSchema = {
  nombre: "",
  descripcion: "",
  icono_nombre: "room-service",
  propiedades: [],
};
