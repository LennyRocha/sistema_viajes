import { z } from "zod";
import { LICENSE_CATEGORIES, MEXICAN_STATES } from "../data/licenseOptions";

// Campos propios de la licencia, sin conductor_id
// (se reusa anidado dentro de conductorZod.ts para el registro conjunto)
export const licenciaBaseSchema = z.object({
  numero_licencia: z
    .string()
    .regex(/^\d{8,12}$/, {
      message: "El numero de licencia debe contener entre 8 y 12 digitos",
    }),
  categoria: z.enum(LICENSE_CATEGORIES.map(({ value }) => value) as [string, ...string[]], {
    message: "Selecciona una categoria de licencia",
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
  estado_emisor: z.enum(MEXICAN_STATES, {
    message: "Selecciona el estado emisor",
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
