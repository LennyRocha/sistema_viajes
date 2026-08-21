import { z } from "zod";

// Campos propios de la licencia, sin conductor_id
// (se reusa anidado dentro de conductorZod.ts para el registro conjunto)
export const licenciaBaseSchema = z.object({
  numero_licencia: z
    .string()
    .min(1, {
      message: "El número de licencia es obligatorio",
    })
    .max(30, {
      message: "El número de licencia no puede exceder los 30 caracteres",
    }),
  categoria: z
    .string()
    .min(1, {
      message: "La categoría de la licencia es obligatoria",
    })
    .max(20, {
      message: "La categoría no puede exceder los 20 caracteres",
    }),
  fecha_expedicion: z
    .string()
    .min(1, {
      message: "La fecha de expedición es obligatoria",
    })
    .transform((val) => new Date(val).toISOString()),
  fecha_vencimiento: z
    .string()
    .min(1, {
      message: "La fecha de vencimiento es obligatoria",
    })
    .transform((val) => new Date(val).toISOString()),
  estado_emisor: z
    .string()
    .min(1, {
      message: "El estado emisor es obligatorio",
    })
    .max(100, {
      message: "El estado emisor no puede exceder los 100 caracteres",
    }),
  imagen_licencia: z
    .string()
    .min(1, {
      message: "La imagen de la licencia es obligatoria",
    })
    .max(3_000_000, {
      message: "La imagen de la licencia no puede exceder el tamano permitido",
    }),
  vigente: z.boolean(),
});

// Schema completo para el endpoint standalone /licencias
export const licenciaSchema = licenciaBaseSchema.extend({
  conductor_id: z.number().min(1, {
    message: "El ID del conductor es obligatorio",
  }),
});

export const renewLicenciaSchema = licenciaBaseSchema
  .omit({
    vigente: true,
  })
  .partial({
    numero_licencia: true,
    categoria: true,
    estado_emisor: true,
  })
  .refine(
    (value) =>
      new Date(value.fecha_vencimiento).getTime() >
      new Date(value.fecha_expedicion).getTime(),
    {
      message: "La fecha de vencimiento debe ser posterior a la expedición",
      path: ["fecha_vencimiento"],
    },
  );

export type LicenciaSchema = z.infer<typeof licenciaSchema>;
export type LicenciaBaseSchema = z.infer<typeof licenciaBaseSchema>;
export type RenewLicenciaSchema = z.infer<typeof renewLicenciaSchema>;
