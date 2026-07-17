import { SnackFunctionProps } from "@nexoroute/commons";
import { ServicioSchema } from "../validations/servicioZod";
import ServicioExterno from "../types/ServicioExterno";
import CampoConfig from "../types/CampoServicio";
export default async function onSubmit(
  data: ServicioSchema,
  {
    snack,
    navigationFunction,
    mutate,
  }: {
    snack?: SnackFunctionProps;
    navigationFunction: (
      href: string,
      options?: any,
    ) => void;
    mutate: (
      servicio: Omit<ServicioExterno, "id" | "estatus">,
    ) => Promise<any>;
  },
) {
  const payload: Omit<ServicioExterno, "id" | "estatus"> = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    icono_nombre: data.icono_nombre,
    propiedades: data.propiedades as CampoConfig[],
    disponibilidad: [],
  };
  await mutate(payload);
  snack?.success({
    message: "Servicio creado correctamente",
  });
  navigationFunction("/services", { replace: true });
}
