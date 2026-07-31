import { z } from "zod";
import { licenciaBaseSchema } from "./licenciaZod";

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
    .min(1, {
      message: "La CURP es obligatoria",
    })
    .max(18, {
      message: "La CURP no puede exceder los 18 caracteres",
    }),
  fecha_nacimiento: z
    .string()
    .min(1, {
      message: "La fecha de nacimiento es obligatoria",
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
  institucion_id: conductorSchema.shape.institucion_id.optional()
});

export type UpdateConductorSchema = z.infer<typeof updateConductorSchema>;