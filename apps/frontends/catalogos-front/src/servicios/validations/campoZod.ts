import { z } from "zod";

export const campoConfigSchema = z.object({
  uuid: z.string(),
  clave: z
    .string()
    .min(3, {
      message:
        "La clave de la propiedad debe tener al menos 3 caracteres",
    })
    .max(50, {
      message:
        "La clave de la propiedad no puede exceder los 50 caracteres",
    }),
  label: z
    .string()
    .min(3, {
      message:
        "El nombre de la propiedad debe tener al menos 3 caracteres",
    })
    .max(50, {
      message:
        "El nombre de la propiedad no puede exceder los 50 caracteres",
    }),
  tipo: z.enum(["string", "number", "boolean"], {
    message:
      "El tipo de la propiedad es obligatorio y debe ser 'string', 'number' o 'boolean'",
  }),
  inputTipo: z
    .enum([
      "text",
      "textarea",
      "number",
      "checkbox",
      "select",
      "radio",
      "switch",
    ])
    .optional(),
  requerido: z.boolean(),
  min: z
    .number()
    .min(0, {
      message: "El valor mínimo no puede ser negativo",
    })
    .optional(),
  max: z
    .number()
    .min(0, {
      message: "El valor máximo no puede ser negativo",
    })
    .optional(),
  minLength: z
    .number()
    .min(0, {
      message: "La longitud mínima no puede ser negativa",
    })
    .optional(),
  maxLength: z
    .number()
    .min(0, {
      message: "La longitud máxima no puede ser negativa",
    })
    .optional(),
  regex: z.string().optional(),
  placeholder: z
    .string()
    .min(5, {
      message:
        "El texto de ayuda debe tener al menos 5 caracteres",
    })
    .max(50, {
      message:
        "El texto de ayuda no puede exceder los 50 caracteres",
    })
    .optional(),
  opciones: z
    .array(z.string().or(z.number()))
    .min(1, {
      message:
        "La propiedad debe tener al menos una opción",
    })
    .optional(),
  defaultValue: z
    .string()
    .or(z.boolean())
    .or(z.number())
    .optional(),
  visible: z
    .object({
      campo: z.string(),
      valor: z.string().or(z.boolean()).or(z.number()),
    })
    .optional(),
});

export type CampoConfigSchema = z.infer<
  typeof campoConfigSchema
>;
