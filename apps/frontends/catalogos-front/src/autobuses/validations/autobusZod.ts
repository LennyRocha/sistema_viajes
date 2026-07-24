import { z } from "zod";
import AutobusEstado from "../types/AutobusEstado";

export const autobusSchema = z.object({
  codigo_interno: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, {
      message:
        "El código interno solo puede contener letras, números y guiones",
    })
    .min(1, {
      message:
        "El código interno del autobús es obligatorio",
    })
    .max(10, {
      message:
        "El código interno no puede exceder los 10 caracteres",
    }),
  marca: z
    .string()
    .min(1, {
      message: "La marca del autobús es obligatoria",
    })
    .max(50, {
      message:
        "La marca no puede exceder los 50 caracteres",
    }),
  alias: z
    .string()
    .min(1, {
      message: "El alias del autobús es obligatorio",
    })
    .max(25, {
      message:
        "El alias no puede exceder los 25 caracteres",
    }),
  modelo: z
    .string()
    .min(1, {
      message: "El modelo del autobús es obligatorio",
    })
    .max(50, {
      message:
        "El modelo no puede exceder los 50 caracteres",
    }),
  ano: z
    .number()
    .min(1950, {
      message:
        "El año del autobús debe ser mayor o igual a 1950",
    })
    .max(new Date().getFullYear(), {
      message: `El año del autobús debe ser menor o igual a ${new Date().getFullYear()}`,
    }),
  capacidad: z
    .number()
    .min(1, {
      message:
        "La capacidad del autobús debe ser mayor o igual a 1",
    })
    .max(44, {
      message:
        "La capacidad del autobús debe ser menor o igual a 44",
    }),
  estado: z.enum(AutobusEstado, {
    message:
      "El estado del autobús debe ser uno de los siguientes valores: " +
      Object.values(AutobusEstado).join(", "),
  }),
  color: z
    .string()
    .min(1, {
      message: "El color del autobús es obligatorio",
    })
    .max(50, {
      message:
        "El color no puede exceder los 50 caracteres",
    }),
  descripcion: z
    .string()
    .min(1, {
      message: "La descripción del autobús es obligatoria",
    })
    .max(255, {
      message:
        "La descripción no puede exceder los 255 caracteres",
    }),
  institucion_id: z.number().min(1, {
    message: "El ID de la institución es obligatorio",
  }),
  tipo_autobus_id: z.number().min(1, {
    message: "El ID del tipo de autobús es obligatorio",
  }),
  asientos: z.array(z.any()).min(1, {
    message: "El autobús debe tener al menos un asiento",
  }),
  servicios: z.array(z.any()).min(1, {
    message: "El autobús debe tener al menos un servicio",
  }),
});

export type AutobusSchema = z.infer<typeof autobusSchema>;
