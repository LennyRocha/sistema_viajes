import { z } from "zod";
import { licenciaBaseSchema } from "./licenciaZod";

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export const conductorSchema = z.object({
  nombres: z
    .string()
    .min(1, {
      message: "El nombre del conductor es obligatorio",
    })
    .max(100, {
      message: "El nombre no puede exceder los 100 caracteres",
    }),
  apellido_paterno: z
    .string()
    .min(1, {
      message: "El apellido paterno es obligatorio",
    })
    .max(100, {
      message: "El apellido paterno no puede exceder los 100 caracteres",
    }),
  apellido_materno: z
    .string()
    .min(1, {
      message: "El apellido materno es obligatorio",
    })
    .max(100, {
      message: "El apellido materno no puede exceder los 100 caracteres",
    }),
  curp: z
    .string()
    .trim()
    .min(1, {
      message: "La CURP es obligatoria",
    })
    .max(18, {
      message: "La CURP no puede exceder los 18 caracteres",
    })
    .refine((value) => CURP_REGEX.test(value.toUpperCase()), {
      message: "La CURP no tiene un formato válido",
    }),
  fecha_nacimiento: z
    .string()
    .trim()
    .min(1, {
      message: "La fecha de nacimiento es obligatoria",
    })
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, {
      message: "La fecha de nacimiento no es válida",
    })
    .transform((val) => new Date(val).toISOString()),
  telefono: z
    .string()
    .min(1, {
      message: "El teléfono es obligatorio",
    })
    .max(15, {
      message: "El teléfono no puede exceder los 15 caracteres",
    }),
  email: z
    .string()
    .min(1, {
      message: "El email es obligatorio",
    })
    .email({
      message: "El email debe tener un formato válido",
    })
    .max(150, {
      message: "El email no puede exceder los 150 caracteres",
    }),
  foto_perfil: z
    .string()
    .min(1, {
      message: "La foto de perfil es obligatoria",
    })
    .max(255, {
      message: "La ruta de la foto no puede exceder los 255 caracteres",
    }),
  institucion_id: z.number().min(1, {
    message: "El ID de la institución es obligatorio",
  }),
  licencia: licenciaBaseSchema,
});

export type ConductorSchema = z.infer<typeof conductorSchema>;

// ==========================
// Update (todos los campos opcionales, incluida la licencia anidada)
// ==========================
export const updateConductorSchema = z.object({
  nombres: conductorSchema.shape.nombres.optional(),
  apellido_paterno: conductorSchema.shape.apellido_paterno.optional(),
  apellido_materno: conductorSchema.shape.apellido_materno.optional(),
  curp: conductorSchema.shape.curp.optional(),
  fecha_nacimiento: conductorSchema.shape.fecha_nacimiento.optional(),
  telefono: conductorSchema.shape.telefono.optional(),
  email: conductorSchema.shape.email.optional(),
  foto_perfil: conductorSchema.shape.foto_perfil.optional(),
  institucion_id: conductorSchema.shape.institucion_id.optional(),
});

export type UpdateConductorSchema = z.infer<typeof updateConductorSchema>;