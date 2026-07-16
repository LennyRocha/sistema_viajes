import { z } from "zod";
import { campoConfigSchema } from "./campoZod";

export const servicioSchema = z.object({
  nombre: z
    .string()
    .min(5, {
      message:
        "El nombre del servicio debe tener al menos 5 caracteres",
    })
    .max(50, {
      message:
        "El nombre del servicio no puede exceder los 50 caracteres",
    }),
  descripcion: z
    .string()
    .min(20, {
      message:
        "La descripción del servicio debe tener al menos 20 caracteres",
    })
    .max(500, {
      message:
        "La descripción del servicio no puede exceder los 500 caracteres",
    }),
  icono_nombre: z.string().max(50, {
    message:
      "El nombre del ícono no puede exceder los 50 caracteres",
  }),
  propiedades: z
    .array(campoConfigSchema)
    .min(1, {
      message:
        "El servicio debe tener al menos una propiedad",
    })
    .max(20, {
      message:
        "El servicio no puede tener más de 20 propiedades",
    })
    .optional(),
});

export type ServicioSchema = z.infer<typeof servicioSchema>;