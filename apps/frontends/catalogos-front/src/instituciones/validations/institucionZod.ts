import { z } from "zod";

export const institucionSchema = z.object({
  nombre: z
    .string()
    .min(3, {
      message:
        "El nombre de la institución debe tener al menos 3 caracteres",
    })
    .max(50, {
      message:
        "El nombre de la institución no puede exceder los 50 caracteres",
    }),
  descripcion: z
    .string()
    .min(20, {
      message:
        "La descripción de la institución debe tener al menos 20 caracteres",
    })
    .max(100, {
      message:
        "La descripción de la institución no puede exceder los 100 caracteres",
    }),
  imagen_url: z
    .url({
      message:
        "La URL de la imagen de la institución debe ser una URL válida",
    })
    .min(5, {
      message:
        "La URL de la imagen de la institución debe tener al menos 5 caracteres",
    })
    .max(255, {
      message:
        "La URL de la imagen de la institución no puede exceder los 255 caracteres",
    }),
});

export type InstitucionSchema = z.infer<
  typeof institucionSchema
>;
