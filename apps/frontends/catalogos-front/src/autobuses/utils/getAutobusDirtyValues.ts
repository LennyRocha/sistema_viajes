import AutobusServicio from "../types/AutobusServicio";
import { AutobusSchema } from "../validations/autobusZod";

export function getAutobusDirtyValues(
  dirtyFields: any,
  values: AutobusSchema,
): Partial<AutobusSchema> {
  if (dirtyFields === true) {
    return values;
  }

  return Object.keys(dirtyFields).reduce((acc, key) => {
    const dirty = dirtyFields[key];
    const value = (values as any)[key];

    if (dirty) {
      if (key === "servicios") {
        (acc as any)[key] = [
          ...value
            .filter(Boolean)
            .map((s: AutobusServicio) => ({
              servicio_id: s.servicioId,
              config_servicio: s.configuracion_servicio,
            })),
        ];
      } else {
        (acc as any)[key] = value;
      }
    }

    return acc;
  }, {} as Partial<AutobusSchema>);
}
